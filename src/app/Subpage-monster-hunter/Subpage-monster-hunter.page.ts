import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonPopover,
  IonList,
  IonListHeader,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MonsterHunterApiService } from '../Monster-Hunter.api/Monster-Hunter.api.service';
import { Location } from '@angular/common';

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

const MONSTER_ORDER: string[] = [
  // Kleintiere
  'Aptonoth',
  'Jagras',
  'Mernos',
  'Mosswine',
  'Kelbi',
  'Noios',
  'Gajau',
  'Raphinos',
  'Apceros',
  'Kestodon',
  'Shamos',
  'Hornetaur',
  'Gastodon',
  'Barnos',

  // Niedriges Rang Monster
  'Great Jagras',
  'Kulu-Ya-Ku',
  'Pukei-Pukei',
  'Barroth',
  'Jyuratodus',
  'Tobi-Kadachi',
  'Tzitzi-Ya-Ku',
  'Anjanath',
  'Radobaan',
  'Paolumu',
  'Great Girros',

  // Mittleres Rang Monster
  'Legiana',
  'Odogaron',
  'Pink Rathian',
  'Rathalos',
  'Diablos',
  'Black Diablos',

  // Hohes Rang Monster
  'Deviljho',
  'Lunastra',
  'Teostra',
  'Kushala Daora',
  'Vaal Hazak',
  'Nergigante',
  'Zorah Magdaros',
  'Azure Rathian',
  'Bazelgeuse',
  'Xeno`jiiva',
  'Kirin',
  'Kulve Taroth',
  'Behemoth',
  'Leshen',
  'Ancient Leshen',
  'Safi`jiiva',
  'Rajang',
  'Viper Tobi-Kadachi',
  'Namielle',
  'Zinogre',
  'Stygian Zinogre'
];

@Component({
  selector: 'app-Subpage-Monster-Hunter',
  templateUrl: 'Subpage-monster-hunter.page.html',
  styleUrls: ['Subpage-monster-hunter.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonPopover,
    IonList,
    IonListHeader,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardContent,
    IonSkeletonText
  ]
})
export class SubpageMonsterHunterPage implements OnInit {
  @ViewChild(IonPopover) weaponPopover!: IonPopover;

  monster: any;
  isLoading = true;
  isWeaponsLoading = true;
  bestWeapons: Weapon[] = [];
  filteredBestWeapons: Weapon[] = [];
  allWeapons: Weapon[] = [];
  currentView: 'monster' | 'weapon' = 'monster';
  selectedWeapon: Weapon | null = null;
  upgradedWeapons: Weapon[] = [];
  isUpgradesLoading = false;

  // Properties für Waffentyp-Filter
  weaponTypes: string[] = [];
  selectedWeaponType: string = '';

  // Für spätere Filter-Logik zwischengespeichert
  private weaknessMap: Map<string, number> = new Map();

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private monsterApiService: MonsterHunterApiService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
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

  private loadMonster(id: number) {
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

  private loadWeapons() {
    this.isWeaponsLoading = true;
    this.monsterApiService.getAllWeapons().subscribe({
      next: (weapons) => {
        this.allWeapons = weapons;
        this.weaponTypes = [...new Set(weapons.map((w) => w.type))].sort();
        this.calculateBestWeapons(weapons);
        this.isWeaponsLoading = false;
      },
      error: () => {
        this.isWeaponsLoading = false;
      }
    });
  }

  /**
   * Legt das initiale Set an „best weapons“ fest und speichert Schwächen-Map.
   * Hier wurde die monsterIndex-Abfrage so angepasst, dass bei index < 0
   * keine Material-Beschränkung erfolgt.
   */
  private calculateBestWeapons(weapons: Weapon[]) {
    // 1) Schwächen-Map erstellen
    this.weaknessMap = new Map<string, number>(
      this.monster.weaknesses.map((w: any) => [w.element, w.stars])
    );

    // 2) Welche Monster sind „verfügbar“ (im MONSTER_ORDER vor dem aktuellen Monster)
    const monsterIndex = MONSTER_ORDER.indexOf(this.monster.name);
    let availableMonsters: Set<string>;
    if (monsterIndex < 0) {
      // Monster-Name nicht in MONSTER_ORDER gefunden → keine Material-Beschränkung
      availableMonsters = new Set<string>();
    } else {
      availableMonsters = new Set(MONSTER_ORDER.slice(0, monsterIndex));
    }

    // 3) Alle craftbaren Waffen (rekursiv prüfen)
    const weaponsWithMaterials = weapons.filter((weapon) =>
      this.isCraftableWithAvailableMaterials(weapon, availableMonsters)
    );

    // 4) Iron-Weapon-Fallback (falls keine craftbare Variante von diesem Typ vorhanden ist)
    const ironWeapons = weapons.filter(
      (weapon) =>
        this.isIronWeapon(weapon) &&
        !weapon.crafting.previous &&
        weapon.crafting.craftable
    );

    // 5) Sicherstellen, dass von jedem Waffentyp mindestens eine Waffe da ist
    const allWeaponTypes = [...new Set(weapons.map((w) => w.type))];
    const candidateWeapons = this.ensureWeaponTypeCoverage(
      weaponsWithMaterials,
      ironWeapons,
      allWeaponTypes
    );

    // 6) Score berechnen, sortieren, Top 6 zurückgeben
    this.bestWeapons = this.scoreAndSortWeapons(candidateWeapons, this.weaknessMap).slice(0, 6);

    // Initial: gefilterte Liste == alle Top 6
    this.filteredBestWeapons = [...this.bestWeapons];
    this.selectedWeaponType = '';
  }

  /**
   * Wird aufgerufen, sobald eine Auswahl im Popover getroffen wurde.
   * Setzt `selectedWeaponType`, führt `filterWeapons()` aus und schließt das Popover.
   */
  handleSelectChange() {
    this.filterWeapons();
    this.weaponPopover.dismiss();
  }

  /**
   * Filtern nach ausgewähltem weaponType:
   * - Wenn `selectedWeaponType === ''`, dann Rückgabe der ursprünglichen Top 6
   * - Sonst: craftbare Waffen dieses Typs ermitteln (mit Fallback auf Iron-Weapon),
   *   Score berechnen und Top 6 nehmen.
   * Auch hier wird monsterIndex geprüft und bei index < 0 keine Material-Beschränkung verwendet.
   */
  filterWeapons() {
    if (!this.selectedWeaponType) {
      this.filteredBestWeapons = [...this.bestWeapons];
      return;
    }

    const weaknessMap = this.weaknessMap;
    const monsterIndex = MONSTER_ORDER.indexOf(this.monster.name);
    let availableMonsters: Set<string>;
    if (monsterIndex < 0) {
      // Monster-Name nicht in MONSTER_ORDER gefunden → keine Material-Beschränkung
      availableMonsters = new Set<string>();
    } else {
      availableMonsters = new Set<string>(MONSTER_ORDER.slice(0, monsterIndex));
    }

    // zuerst alle craftbaren Waffen dieses Typs
    const weaponsOfTypeAndCraftable = this.allWeapons.filter((weapon) => {
      if (weapon.type !== this.selectedWeaponType) return false;
      return this.isCraftableWithAvailableMaterials(weapon, availableMonsters);
    });

    // Iron-Weapon-Fallback dieses Typs
    const ironWeaponsOfType = this.allWeapons.filter(
      (weapon) =>
        weapon.type === this.selectedWeaponType &&
        this.isIronWeapon(weapon) &&
        !weapon.crafting.previous &&
        weapon.crafting.craftable
    );

    const candidates =
      weaponsOfTypeAndCraftable.length > 0 ? weaponsOfTypeAndCraftable : ironWeaponsOfType;

    const scoredSorted = this.scoreAndSortWeapons(candidates, weaknessMap);
    this.filteredBestWeapons = scoredSorted.slice(0, 6);
  }

  private isCraftableWithAvailableMaterials(
    weapon: Weapon,
    availableMonsters: Set<string>
  ): boolean {
    if (!weapon.crafting?.craftable) return false;

    let currentWeapon: Weapon | undefined = weapon;
    while (currentWeapon) {
      const materials = this.getMaterials(currentWeapon);
      const canCraft = materials.every((m) =>
        this.isMaterialAllowed(m.item.name, availableMonsters)
      );
      if (!canCraft) return false;
      currentWeapon = currentWeapon.crafting.previous
        ? this.getWeaponById(currentWeapon.crafting.previous)
        : undefined;
    }
    return true;
  }

  private ensureWeaponTypeCoverage(
    mainWeapons: Weapon[],
    fallbackWeapons: Weapon[],
    allTypes: string[]
  ): Weapon[] {
    const result = [...mainWeapons];
    const coveredTypes = new Set(mainWeapons.map((w) => w.type));
    allTypes.forEach((type) => {
      if (!coveredTypes.has(type)) {
        const fallback = fallbackWeapons.find((w) => w.type === type);
        if (fallback) result.push(fallback);
      }
    });
    return result;
  }

  private scoreAndSortWeapons(
    weapons: Weapon[],
    weaknessMap: Map<string, number>
  ): Weapon[] {
    const topWeakness =
      [...weaknessMap.entries()].sort((a, b) => b[1] - a[1])[0] || ['', 0];

    return weapons
      .map((weapon) => {
        const elementMatch = (weapon.elements || []).find(
          (el) => el.type === topWeakness[0]
        );
        const elementBonus = elementMatch
          ? elementMatch.damage * (topWeakness[1] + 1) * 1000
          : 0;
        return {
          ...weapon,
          displayName: this.formatWeaponName(weapon.name),
          score: (weapon.attack?.raw || 0) + elementBonus
        };
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  private isIronWeapon(weapon: Weapon): boolean {
    return /iron/i.test(weapon.name) && !/dragonbone|bone/i.test(weapon.name);
  }

  private isMaterialAllowed(
    materialName: string,
    availableMonsters: Set<string>
  ): boolean {
    materialName = materialName.toLowerCase();
    const matchingMonster = MONSTER_ORDER.find((monster) =>
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
    return (
      !!weapon.assets?.image &&
      !broken.includes(weapon.name.toLocaleLowerCase()) &&
      !broken.includes(weapon.id.toString())
    );
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
        history.pushState(
          { view: 'weapon', weaponId: fullWeapon.id },
          '',
          this.location.path()
        );
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

  /**
   * Klick auf den Back-Button: geht eine Ansicht zurück (history.back()).
   */
  goBack() {
    this.location.back();
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
    const type =
      weapon.type === 'great-sword' || weapon.type === 'long-sword'
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
    this.bestWeapons = this.bestWeapons.filter((w) => w.id !== weapon.id);
    img.src = 'assets/placeholder-weapon.png';
    img.style.opacity = '1';
  }

  hasDropData(): boolean {
    return !!this.monster?.rewards?.length;
  }

  getDropsByType(type: string): DropDisplay[] {
    if (!this.hasDropData()) return [];
    return this.monster.rewards
      .filter((r: MonsterReward) =>
        r.conditions.some(
          (c: Condition) => c.type.toLowerCase() === type.toLowerCase()
        )
      )
      .map((r: MonsterReward) => {
        const c = r.conditions.find(
          (cond: Condition) => cond.type.toLowerCase() === type.toLowerCase()
        );
        return {
          item: r.item,
          chance: c?.chance || 0,
          conditions: c?.rank || ''
        };
      });
  }

  private getWeaponById(id: number): Weapon | undefined {
    return this.allWeapons.find((w) => w.id === id);
  }
}
