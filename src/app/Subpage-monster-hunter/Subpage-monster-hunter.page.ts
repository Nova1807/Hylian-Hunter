// All imports unchanged
import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonCard, IonCardContent,
  IonSkeletonText, IonButton, IonIcon
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MonsterHunterApiService } from "../Monster-Hunter.api/Monster-Hunter.api.service";
import { Location } from '@angular/common';

// Interfaces unchanged
interface Crafting {
  craftable: boolean;
  previous?: number;
  branches?: number[];
  craftingMaterials?: Material[];
  upgradeMaterials?: Material[];
}
interface Material {
  quantity: number;
  item: RewardItem;
}
interface Condition {
  type: string;
  subtype: string | null;
  rank: string;
  quantity: number;
  chance: number;
}
interface RewardItem {
  id: number;
  name: string;
  description: string;
  rarity: number;
  carryLimit: number;
  value: number;
}
interface MonsterReward {
  id: number;
  item: RewardItem;
  conditions: Condition[];
}
interface DropDisplay {
  item: RewardItem;
  chance: number;
  conditions: string;
}
interface Weapon {
  id: number;
  name: string;
  type: string;
  attack?: { raw: number };
  elements?: { type: string; damage: number }[];
  crafting: Crafting;
  displayName?: string;
  score?: number;
  assets?: {
    icon: string;
    image: string;
  };
}

// Korrigierte Monster-Reihenfolge
const MONSTER_ORDER: string[] = [
  // Kleintiere
  'Aptonoth', 'Jagras', 'Mernos', 'Mosswine', 'Kelbi', 'Noios', 'Gajau',
  'Raphinos', 'Apceros', 'Kestodon', 'Shamos', 'Hornetaur', 'Gastodon', 'Barnos',

  // Niedriges Rang Monster
  'Great Jagras', 'Kulu-Ya-Ku', 'Pukei-Pukei', 'Barroth', 'Jyuratodus',
  'Tobi-Kadachi', 'Tzitzi-Ya-Ku', 'Anjanath', 'Radobaan', 'Paolumu', 'Great Girros',

  // Mittleres Rang Monster
  'Legiana', 'Odogaron', 'Pink Rathian', 'Rathalos', 'Diablos', 'Black Diablos',

  // Hohes Rang Monster
  'Deviljho', 'Lunastra', 'Teostra', 'Kushala Daora', 'Vaal Hazak', 'Nergigante',
  'Zorah Magdaros', 'Azure Rathian', 'Bazelgeuse', 'Xeno`jiiva', 'Kirin',
  'Kulve Taroth', 'Behemoth', 'Leshen', 'Ancient Leshen', 'Safi`jiiva',
  'Rajang', 'Viper Tobi-Kadachi', 'Namielle', 'Zinogre', 'Stygian Zinogre'
];

@Component({
  selector: 'app-Subpage-Monster-Hunter',
  templateUrl: 'Subpage-monster-hunter.page.html',
  styleUrls: ['Subpage-monster-hunter.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonCard, IonCardContent,
    IonSkeletonText, IonButton, IonIcon
  ],
})
export class SubpageMonsterHunterPage implements OnInit {
  monster: any;
  isLoading = true;
  isWeaponsLoading = true;
  bestWeapons: Weapon[] = [];
  allWeapons: Weapon[] = [];
  currentView: 'monster' | 'weapon' = 'monster';
  selectedWeapon: Weapon | null = null;
  upgradedWeapons: Weapon[] = [];
  isUpgradesLoading = false;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private monsterApiService: MonsterHunterApiService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadMonster(+id);
      }
    });

    window.addEventListener('popstate', (event) => {
      this.currentView = event.state?.view || 'monster';
      this.selectedWeapon = null;
    });
  }

  loadMonster(id: number) {
    this.isLoading = true;
    this.monsterApiService.getMonsterById(id).subscribe({
      next: (monster) => {
        this.monster = monster;
        this.processMonsterData();
        this.isLoading = false;
        this.loadWeapons();
      },
      error: () => {
        this.isLoading = false;
        this.isWeaponsLoading = false;
      }
    });
  }

  loadWeapons() {
    this.isWeaponsLoading = true;
    this.monsterApiService.getAllWeapons().subscribe({
      next: (weapons) => {
        this.allWeapons = weapons;
        this.calculateBestWeapons(weapons);
        this.isWeaponsLoading = false;
      },
      error: () => {
        this.isWeaponsLoading = false;
      }
    });
  }

  private calculateBestWeapons(weapons: Weapon[]) {
    const weaknessMap = new Map<string, number>(
      this.monster.weaknesses.map((w: any) => [w.element, w.stars])
    );
    const monsterIndex = MONSTER_ORDER.indexOf(this.monster.name);
    const availableMonsters = new Set(MONSTER_ORDER.slice(0, monsterIndex));
    const allWeaponTypes = [...new Set(weapons.map(w => w.type))];

    const weaponsWithMaterials = weapons.filter(weapon =>
      this.isCraftableWithAvailableMaterials(weapon, availableMonsters)
    );

    const ironWeapons = weapons.filter(weapon =>
      this.isIronWeapon(weapon) &&
      !weapon.crafting.previous &&
      weapon.crafting.craftable
    );

    const candidateWeapons = this.ensureWeaponTypeCoverage(
      weaponsWithMaterials,
      ironWeapons,
      allWeaponTypes
    );

    this.bestWeapons = this.scoreAndSortWeapons(
      candidateWeapons,
      weaknessMap
    ).slice(0, 6);
  }

  private isCraftableWithAvailableMaterials(weapon: Weapon, availableMonsters: Set<string>): boolean {
    if (!weapon.crafting?.craftable) return false;

    let currentWeapon: Weapon | undefined = weapon;
    while (currentWeapon) {
      const materials = this.getMaterials(currentWeapon);
      const canCraft = materials.every(m =>
        this.isMaterialAllowed(m.item.name, availableMonsters)
      );

      if (!canCraft) return false;
      currentWeapon = currentWeapon.crafting.previous ?
        this.getWeaponById(currentWeapon.crafting.previous) : undefined;
    }
    return true;
  }

  private ensureWeaponTypeCoverage(
    mainWeapons: Weapon[],
    fallbackWeapons: Weapon[],
    allTypes: string[]
  ): Weapon[] {
    const result = [...mainWeapons];
    const coveredTypes = new Set(mainWeapons.map(w => w.type));

    allTypes.forEach(type => {
      if (!coveredTypes.has(type)) {
        const fallback = fallbackWeapons.find(w => w.type === type);
        if (fallback) result.push(fallback);
      }
    });

    return result;
  }

  private scoreAndSortWeapons(weapons: Weapon[], weaknessMap: Map<string, number>): Weapon[] {
    const topWeakness = [...weaknessMap.entries()]
      .sort((a, b) => b[1] - a[1])[0] || ['', 0];

    return weapons.map(weapon => {
      const elementMatch = (weapon.elements || []).find(
        el => el.type === topWeakness[0]
      );

      const elementBonus = elementMatch ?
        elementMatch.damage * (topWeakness[1] + 1) * 1000 : 0;

      return {
        ...weapon,
        displayName: this.formatWeaponName(weapon.name),
        score: (weapon.attack?.raw || 0) + elementBonus
      };
    }).sort((a, b) => b.score - a.score);
  }

  private isIronWeapon(weapon: Weapon): boolean {
    return /iron/i.test(weapon.name) &&
      !/dragonbone|bone/i.test(weapon.name);
  }

  private isMaterialAllowed(materialName: string, availableMonsters: Set<string>): boolean {
    materialName = materialName.toLowerCase();

    const matchingMonster = MONSTER_ORDER.find(monster =>
      materialName.includes(monster.toLowerCase())
    );

    if (!matchingMonster) return true;
    return availableMonsters.has(matchingMonster);
  }

  public getMaterials(weapon: Weapon): Material[] {
    return weapon.crafting.craftable
      ? weapon.crafting.craftingMaterials || []
      : weapon.crafting.upgradeMaterials || [];
  }

  private hasValidImage(weapon: Weapon): boolean {
    const broken = ['gae bolg', 'specific-broken-weapon-id'];
    return !!weapon.assets?.image &&
      !broken.includes(weapon.name.toLowerCase()) &&
      !broken.includes(weapon.id.toString());
  }

  showWeapon(weapon: Weapon) {
    this.monsterApiService.getWeaponById(weapon.id).subscribe({
      next: (fullWeapon: Weapon) => {
        this.selectedWeapon = {
          ...fullWeapon,
          displayName: this.formatWeaponName(fullWeapon.name)
        };
        this.loadUpgradedWeapons(fullWeapon.crafting?.branches || []);
        this.currentView = 'weapon';
        history.pushState({ view: 'weapon', weaponId: fullWeapon.id }, '', this.location.path());
      },
      error: () => {
        this.selectedWeapon = weapon;
        this.currentView = 'weapon';
        this.upgradedWeapons = [];
      }
    });
  }

  private loadUpgradedWeapons(branchIds: number[]) {
    if (!branchIds.length) {
      this.upgradedWeapons = [];
      return;
    }
    this.isUpgradesLoading = true;
    this.monsterApiService.getWeaponsByIds(branchIds).subscribe({
      next: (weapons) => {
        this.upgradedWeapons = weapons;
        this.isUpgradesLoading = false;
      },
      error: () => {
        this.upgradedWeapons = [];
        this.isUpgradesLoading = false;
      }
    });
  }

  goBackToMonster() {
    if (history.state?.view === 'weapon') history.back();
    else {
      this.currentView = 'monster';
      this.selectedWeapon = null;
    }
  }

  private processMonsterData() {
    if (this.monster?.weaknesses) {
      this.monster.weaknesses.sort((a: any, b: any) => b.stars - a.stars);
    }
  }

  getImagePath(): string {
    return this.monster?.name
      ? `assets/Monster-Images/${this.monster.name}.png`
      : 'assets/placeholder-monster.png';
  }

  getWeaponImagePath(weapon: Weapon): string {
    if (!weapon?.name) return 'assets/placeholder-weapon.png';
    const type = weapon.type === 'great-sword' || weapon.type === 'long-sword'
      ? 'Swords-1-2'
      : weapon.type;
    return `assets/Weapon/${type}/${weapon.name}.png`;
  }

  formatWeaponName(name: string): string {
    return name.replace(/\sI+$/, '').replace(/\s\d+$/, '').replace(/-/g, ' ');
  }

  onWeaponImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.opacity = '1';
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-monster.png';
    img.style.opacity = '1';
  }

  handleWeaponImageError(event: Event, weapon: Weapon) {
    const img = event.target as HTMLImageElement;
    this.bestWeapons = this.bestWeapons.filter(w => w.id !== weapon.id);
    img.src = 'assets/placeholder-weapon.png';
    img.style.opacity = '1';
  }

  hasDropData(): boolean {
    return !!this.monster?.rewards?.length;
  }

  getDropsByType(type: string): DropDisplay[] {
    if (!this.hasDropData()) return [];
    return this.monster.rewards
      .filter((r: MonsterReward) => r.conditions.some((c: Condition) => c.type.toLowerCase() === type.toLowerCase()))
      .map((r: MonsterReward) => {
        const c = r.conditions.find((cond: Condition) => cond.type.toLowerCase() === type.toLowerCase());
        return {
          item: r.item,
          chance: c?.chance || 0,
          conditions: c?.rank || ''
        };
      });
  }

  private getWeaponById(id: number): Weapon | undefined {
    return this.allWeapons.find(w => w.id === id);
  }
}
