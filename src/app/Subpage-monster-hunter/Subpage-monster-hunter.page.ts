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
import { ActivatedRoute, Router } from '@angular/router';
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
  rarity: number;
  slots: { rank: number }[];
  attack?: {
    raw: number;
    display: number;
  };
  elements?: { type: string; damage: number; hidden?: boolean }[];
  crafting: Crafting;
  displayName?: string;
  score?: number;
  assets?: {
    icon: string;
    image: string;
  };
  attributes?: any;
}

interface Monster {
  id: number;
  name: string;
  type: string;
  species: string;
  description: string;
  weaknesses: { element: string; stars: number }[];
  resistances: { element: string; condition: string }[];
  locations: { id: number; name: string; zoneCount: number }[];
  rewards: MonsterReward[];
  elements: string[];
  additionalInfo?: string;
}

const MONSTER_ORDER: string[] = [
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
  'Legiana',
  'Odogaron',
  'Pink Rathian',
  'Rathalos',
  'Diablos',
  'Black Diablos',
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

  monster: Monster | null = null;
  isLoading = true;
  isWeaponsLoading = true;
  bestWeapons: Weapon[] = [];
  filteredBestWeapons: Weapon[] = [];
  allWeapons: Weapon[] = [];
  currentView: 'monster' | 'weapon' = 'monster';
  selectedWeapon: Weapon | null = null;
  upgradedWeapons: Weapon[] = [];
  isUpgradesLoading = false;
  weaponTypes: string[] = [];
  selectedWeaponType: string = '';
  private weaknessMap: Map<string, number> = new Map();

  private weaponsById = new Map<number, Weapon>();
  private craftableCache = new Map<number, boolean>();
  private monsterNamesLower = MONSTER_ORDER.map(m => m.toLowerCase());

  // Track navigation history for weapon views
  private weaponNavigationStack: number[] = [];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private monsterApiService: MonsterHunterApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const monsterId = params['id'];
      const weaponId = params['weapon'];

      if (monsterId) {
        if (!this.monster || this.monster.id !== +monsterId) {
          this.loadMonster(+monsterId);
        } else if (this.allWeapons.length === 0) {
          this.loadWeapons();
        }

        if (weaponId) {
          this.loadWeapon(+weaponId);
        } else {
          this.currentView = 'monster';
          this.selectedWeapon = null;
          this.weaponNavigationStack = [];
        }
      }
    });
  }

  private loadMonster(id: number) {
    this.isLoading = true;
    this.monsterApiService.getMonsterById(id).subscribe({
      next: (monster) => {
        this.monster = monster as Monster;
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
        this.allWeapons = weapons as Weapon[];
        this.weaponsById.clear();
        this.allWeapons.forEach(weapon => {
          this.weaponsById.set(weapon.id, weapon);
        });

        this.weaponTypes = [...new Set(weapons.map((w: any) => w.type))].sort();
        this.calculateBestWeapons(weapons);
        this.isWeaponsLoading = false;

        const weaponId = this.route.snapshot.queryParamMap.get('weapon');
        if (weaponId) {
          this.loadWeapon(+weaponId);
        }
      },
      error: () => {
        this.isWeaponsLoading = false;
        this.loadFallbackWeapons();
      }
    });
  }

  private loadWeapon(id: number) {
    // Don't reload the same weapon if it's already selected
    if (this.selectedWeapon?.id === id) return;

    const cachedWeapon = this.weaponsById.get(id);
    if (cachedWeapon) {
      this.displayWeapon(cachedWeapon);
      return;
    }

    this.isUpgradesLoading = true;
    this.monsterApiService.getWeaponById(id).subscribe({
      next: (fullWeapon) => {
        this.weaponsById.set(id, fullWeapon);
        this.displayWeapon(fullWeapon);
        this.isUpgradesLoading = false;
      },
      error: () => {
        const fallbackWeapon = this.allWeapons.find(w => w.id === id);
        if (fallbackWeapon) {
          this.weaponsById.set(id, fallbackWeapon);
          this.displayWeapon(fallbackWeapon);
        }
        this.isUpgradesLoading = false;
      }
    });
  }

  private displayWeapon(weapon: Weapon) {
    this.selectedWeapon = {
      ...weapon,
      displayName: this.formatWeaponName(weapon.name)
    };
    this.currentView = 'weapon';

    // Update the navigation stack
    if (!this.weaponNavigationStack.includes(weapon.id)) {
      this.weaponNavigationStack.push(weapon.id);
    }

    this.loadUpgradedWeapons(weapon.crafting?.branches || []);
  }

  private loadUpgradedWeapons(branchIds: number[]) {
    if (!branchIds.length) {
      this.upgradedWeapons = [];
      return;
    }
    this.isUpgradesLoading = true;

    const cachedWeapons: Weapon[] = [];
    const missingIds: number[] = [];

    branchIds.forEach(id => {
      const weapon = this.weaponsById.get(id);
      if (weapon) {
        cachedWeapons.push(weapon);
      } else {
        missingIds.push(id);
      }
    });

    if (missingIds.length === 0) {
      this.upgradedWeapons = cachedWeapons;
      this.isUpgradesLoading = false;
      return;
    }

    this.monsterApiService.getWeaponsByIds(missingIds).subscribe({
      next: (weapons) => {
        weapons.forEach(w => this.weaponsById.set(w.id, w));
        this.upgradedWeapons = [...cachedWeapons, ...weapons];
        this.isUpgradesLoading = false;
      },
      error: () => {
        this.upgradedWeapons = cachedWeapons;
        this.isUpgradesLoading = false;
      }
    });
  }

  showWeapon(weapon: Weapon) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { weapon: weapon.id },
      queryParamsHandling: 'merge'
    });
  }

  showMonsterView() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { weapon: null },
      queryParamsHandling: 'merge'
    });
    this.weaponNavigationStack = [];
  }

  goBack() {
    if (this.currentView === 'weapon') {
      // If we have a navigation stack, go back to previous weapon
      if (this.weaponNavigationStack.length > 1) {
        // Pop current weapon
        this.weaponNavigationStack.pop();

        // Get previous weapon
        const previousWeaponId = this.weaponNavigationStack[this.weaponNavigationStack.length - 1];

        // Navigate to previous weapon
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { weapon: previousWeaponId },
          queryParamsHandling: 'merge'
        });
      } else {
        // No previous weapons in stack, go back to monster view
        this.showMonsterView();
      }
    } else {
      // Navigate back to the homepage
      this.router.navigate(['/tabs/Monster-Hunter']);
    }
  }

  private isIronOrBoneWeapon(weapon: Weapon): boolean {
    if (!weapon.name) return false;
    const name = weapon.name.toLowerCase();
    return name.includes('iron') || name.includes('bone');
  }

  private getTopWeaknessElement(): string {
    if (!this.monster || !this.monster.weaknesses.length) return '';
    return this.monster.weaknesses.reduce((topWeakness, current) =>
      current.stars > topWeakness.stars ? current : topWeakness
    ).element;
  }

  private calculateWeaponScore(weapon: Weapon, topElement: string): number {
    const elementDamage = topElement
      ? (weapon.elements?.find(el => el.type === topElement)?.damage || 0)
      : (weapon.elements?.reduce((sum, el) => sum + el.damage, 0) || 0);
    const attackValue = weapon.attack?.display || weapon.attack?.raw || 0;
    const elementBonus = topElement && elementDamage > 0 ? 10000 : 0;
    return attackValue + elementDamage + elementBonus;
  }

  private getWeaponGroup(weapon: Weapon, topElement: string): number {
    const isStandard = !this.isIronOrBoneWeapon(weapon);
    const hasTopElement = topElement
      ? weapon.elements?.some(el => el.type === topElement) ?? false
      : false;
    const hasAnyElement = (weapon.elements && weapon.elements.length > 0) ?? false;

    if (isStandard) {
      if (hasTopElement) return 1;
      if (hasAnyElement) return 2;
      return 3;
    } else {
      return 4; // Iron/Bone weapons are now excluded completely
    }
  }

  private calculateBestWeapons(weapons: Weapon[]) {
    // Cache leeren für neues Monster
    this.craftableCache.clear();

    const topWeakness = this.getTopWeaknessElement();
    const monsterIndex = this.monster ? MONSTER_ORDER.indexOf(this.monster.name) : -1;
    let availableMonsters: Set<string>;
    if (monsterIndex < 0) {
      availableMonsters = new Set<string>();
    } else {
      availableMonsters = new Set(MONSTER_ORDER.slice(0, monsterIndex));
    }

    // AUSSCHLUSS VON BONE/IRON WAFFEN - WICHTIGSTE ÄNDERUNG
    const weaponsWithMaterials = weapons.filter((weapon) =>
      this.isCraftableWithAvailableMaterials(weapon, availableMonsters) &&
      !this.isIronOrBoneWeapon(weapon) // KEINE Bone/Iron Waffen
    );

    // Berechne Score und displayName für jede Waffe
    const weaponsWithScore = weaponsWithMaterials.map(weapon => ({
      ...weapon,
      displayName: this.formatWeaponName(weapon.name),
      score: this.calculateWeaponScore(weapon, topWeakness)
    }));

    // Gruppiere die Waffen in Prioritätsgruppen
    const groups: Weapon[][] = [[], [], []]; // Nur 3 Gruppen für Standardwaffen

    weaponsWithScore.forEach(weapon => {
      // Iron/Bone Waffen sind bereits gefiltert
      const groupIndex = this.getWeaponGroup(weapon, topWeakness) - 1;
      if (groupIndex >= 0 && groupIndex < 3) {
        groups[groupIndex].push(weapon);
      }
    });

    // Sortiere jede Gruppe nach Score (absteigend)
    groups.forEach(group => {
      group.sort((a, b) => (b.score || 0) - (a.score || 0));
    });

    // Kombiniere die Gruppen in der Reihenfolge ihrer Priorität
    const candidateWeapons = ([] as Weapon[]).concat(...groups);

    // Die besten 6 Waffen auswählen
    this.bestWeapons = candidateWeapons.slice(0, 6);
    this.filteredBestWeapons = [...this.bestWeapons];
    this.selectedWeaponType = '';
  }

  loadFallbackWeapons() {
    console.warn('Loading fallback weapons');
    this.filteredBestWeapons = this.allWeapons
      .filter(weapon =>
        weapon.rarity <= 3 &&
        weapon.type &&
        !this.isIronOrBoneWeapon(weapon)
      )
      .slice(0, 6);
  }

  handleSelectChange() {
    this.filterWeapons();
    this.weaponPopover.dismiss();
  }

  filterWeapons() {
    if (!this.selectedWeaponType) {
      this.filteredBestWeapons = [...this.bestWeapons];
      return;
    }

    const topWeakness = this.getTopWeaknessElement();
    const monsterIndex = this.monster ? MONSTER_ORDER.indexOf(this.monster.name) : -1;
    let availableMonsters: Set<string>;
    if (monsterIndex < 0) {
      availableMonsters = new Set<string>();
    } else {
      availableMonsters = new Set<string>(MONSTER_ORDER.slice(0, monsterIndex));
    }

    const weaponsOfType = this.allWeapons.filter((weapon) => {
      if (weapon.type !== this.selectedWeaponType) return false;
      // AUSSCHLUSS VON BONE/IRON WAFFEN - BEI FILTERUNG
      return this.isCraftableWithAvailableMaterials(weapon, availableMonsters) &&
        !this.isIronOrBoneWeapon(weapon); // KEINE Bone/Iron Waffen
    });

    // Berechne Score und displayName
    const weaponsWithScore = weaponsOfType.map(weapon => ({
      ...weapon,
      displayName: this.formatWeaponName(weapon.name),
      score: this.calculateWeaponScore(weapon, topWeakness)
    }));

    // Gruppieren
    const groups: Weapon[][] = [[], [], []]; // Nur 3 Gruppen

    weaponsWithScore.forEach(weapon => {
      const groupIndex = this.getWeaponGroup(weapon, topWeakness) - 1;
      if (groupIndex >= 0 && groupIndex < 3) {
        groups[groupIndex].push(weapon);
      }
    });

    // Sortiere jede Gruppe
    groups.forEach(group => {
      group.sort((a, b) => (b.score || 0) - (a.score || 0));
    });

    const candidateWeapons = ([] as Weapon[]).concat(...groups);
    this.filteredBestWeapons = candidateWeapons.slice(0, 6);
  }

  // OPTIMIERT: Mit Cache und schneller Materialprüfung
  private isCraftableWithAvailableMaterials(
    weapon: Weapon,
    availableMonsters: Set<string>
  ): boolean {
    if (!weapon.crafting?.craftable) return false;

    // Cache-Check
    if (this.craftableCache.has(weapon.id)) {
      return this.craftableCache.get(weapon.id)!;
    }

    let currentWeapon: Weapon | undefined = weapon;
    let result = true;

    while (currentWeapon && result) {
      const materials = this.getMaterials(currentWeapon);
      result = materials.every(m =>
        this.isMaterialAllowed(m.item.name, availableMonsters)
      );

      if (result) {
        currentWeapon = currentWeapon.crafting.previous
          ? this.getWeaponById(currentWeapon.crafting.previous)
          : undefined;
      }
    }

    // Ergebnis im Cache speichern
    this.craftableCache.set(weapon.id, result);
    return result;
  }

  // OPTIMIERT: Schnellere Materialprüfung mit vorberechneten Namen
  private isMaterialAllowed(
    materialName: string,
    availableMonsters: Set<string>
  ): boolean {
    const normalized = materialName.toLowerCase();

    // Suche nach Monster-Übereinstimmungen
    const foundMonster = this.monsterNamesLower.find(monster =>
      normalized.includes(monster)
    );

    return !foundMonster || availableMonsters.has(foundMonster);
  }

  public getMaterials(weapon: Weapon): Material[] {
    return weapon.crafting.craftable
      ? weapon.crafting.craftingMaterials || []
      : weapon.crafting.upgradeMaterials || [];
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
    if (!name) return '';
    return name.replace(/\sI+$/, '').replace(/\s\d+$/, '').replace(/-/g, ' ');
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
    return this.monster!.rewards
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

  // OPTIMIERT: Schneller Zugriff über Map
  private getWeaponById(id: number): Weapon | undefined {
    return this.weaponsById.get(id);
  }

  navigateToMonster(monsterId: number) {
    this.router.navigate(['/monster-view'], { queryParams: { id: monsterId } });
  }

  getMonsterNameById(id: number): string {
    const monster = this.weaponsById.get(id);
    return monster ? monster.name : 'Unknown Monster';
  }

  getAttributesList(attributes: any): {key: string, value: any}[] {
    return Object.keys(attributes).map(key => ({ key, value: attributes[key] }));
  }
}
