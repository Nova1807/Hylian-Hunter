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

interface Crafting {
  craftable: boolean;
  previous?: number;   // Only present in upgraded weapons
  branches?: number[]; // Upgrade paths
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
  crafting: Crafting; // Changed from optional to required
  displayName?: string;
  score?: number;
  assets?: {
    icon: string;
    image: string;
  };
}

const WEAPON_MATERIALS: { [key: string]: string[] } = {
  // Example materials - expand this with actual game data
  'Buster Sword 1': ['Iron Ore', 'Machalite Ore'],
};

@Component({
  selector: 'app-Subpage-Monster-Hunter',
  templateUrl: 'Subpage-monster-hunter.page.html',
  styleUrls: ['Subpage-monster-hunter.page.scss'],
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
  currentView: 'monster' | 'weapon' = 'monster';
  selectedWeapon: Weapon | null = null;
  upgradedWeapons: Weapon[] = [];
  isUpgradesLoading = false;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private monsterApiService: MonsterHunterApiService
  ) {}

  getMaterials(weapon: Weapon): Material[] {
    if (!weapon.crafting) return [];

    return weapon.crafting.craftable
      ? weapon.crafting.craftingMaterials || []
      : weapon.crafting.upgradeMaterials || [];
  }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadMonster(+id);
      } else {
        console.warn('No monster ID provided in query parameters');
      }
    });

    window.addEventListener('popstate', (event) => {
      if (event.state?.view === 'monster' || !event.state?.view) {
        this.currentView = 'monster';
        this.selectedWeapon = null;
      } else if (event.state?.view === 'weapon') {
        this.currentView = 'weapon';
      }
    });
  }

  loadMonster(id: number) {
    this.isLoading = true;
    this.isWeaponsLoading = true;
    this.currentView = 'monster';
    this.selectedWeapon = null;

    this.monsterApiService.getMonsterById(id).subscribe({
      next: (monster) => {
        this.monster = monster;
        this.processMonsterData();
        this.isLoading = false;
        this.loadWeapons();
      },
      error: (err) => {
        console.error('Error loading monster:', err);
        this.isLoading = false;
        this.isWeaponsLoading = false;
      }
    });
  }

  loadWeapons() {
    this.isWeaponsLoading = true;
    this.monsterApiService.getAllWeapons().subscribe({
      next: (weapons) => {
        this.calculateBestWeapons(weapons);
        this.isWeaponsLoading = false;
      },
      error: (err) => {
        console.error('Error loading weapons:', err);
        this.isWeaponsLoading = false;
      }
    });
  }
  private loadUpgradedWeapons(branchIds: number[]) {
    if (branchIds.length === 0) {
      this.upgradedWeapons = [];
      return;
    }

    this.isUpgradesLoading = true;
    this.monsterApiService.getWeaponsByIds(branchIds).subscribe({
      next: (weapons) => {
        this.upgradedWeapons = weapons;
        this.isUpgradesLoading = false;
      },
      error: (err) => {
        console.error('Error loading upgrades:', err);
        this.upgradedWeapons = [];
        this.isUpgradesLoading = false;
      }
    });
  }

  showWeapon(weapon: Weapon) {

    this.monsterApiService.getWeaponById(weapon.id).subscribe({
      next: (fullWeapon: any) => {
        this.selectedWeapon = {
          ...fullWeapon,
          displayName: this.formatWeaponName(fullWeapon.name)

        };
// Temporary debug code - add to your showWeapon method
        console.log('Selected Weapon Branches:', fullWeapon.crafting?.branches);
        // ====== NEW CODE START ======
        // Load upgraded versions if they exist
        const upgradeIds = fullWeapon.crafting?.branches || [];
        this.loadUpgradedWeapons(upgradeIds);
        // ====== NEW CODE END ======

        this.currentView = 'weapon';
        history.pushState(
          { view: 'weapon', weaponId: fullWeapon.id },
          '',
          this.location.path()
        );
      },
      error: (err) => {
        console.error('Error loading weapon details:', err);
        this.selectedWeapon = { ...weapon };
        this.currentView = 'weapon';
        // ====== NEW CODE START ======
        this.upgradedWeapons = []; // Clear any previous upgrades
        // ====== NEW CODE END ======
      }
    });
  }

  goBackToMonster() {
    if (history.state?.view === 'weapon') {
      history.back();
    } else {
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
    if (!this.monster?.name) return 'assets/placeholder-monster.png';
    return `assets/Monster-Images/${this.monster.name}.png`;
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-monster.png';
    img.style.opacity = '1';
  }
  private hasValidImage(weapon: Weapon): boolean {
    // List of known problematic weapon IDs or names
    const brokenWeapons = ['Gae Bolg 1', 'specific-broken-weapon-id'];

    return !!weapon.assets?.image &&
      !brokenWeapons.includes(weapon.name.toLowerCase()) &&
      !brokenWeapons.includes(weapon.id.toString());
  }

  private calculateBestWeapons(weapons: Weapon[]) {
    if (!this.monster?.weaknesses || !weapons) return;

    const weaknessMap = new Map<string, number>(
      this.monster.weaknesses.map((w: { element: string; stars: number }) => [w.element, w.stars])
    );

    this.bestWeapons = weapons
      .filter(weapon =>
        weapon.crafting?.craftable &&
        !weapon.crafting.previous &&
        this.hasValidImage(weapon) &&
        // Add this exact line to exclude Gae Bolg
        weapon.name.toLowerCase() !== 'gae bolg' // Case-insensitive match
      )
      .map(weapon => ({
        ...weapon,
        displayName: this.formatWeaponName(weapon.name),
        score: this.calculateWeaponScore(weapon, weaknessMap),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }
  private calculateWeaponScore(weapon: Weapon, weaknessMap: Map<string, number>): number {
    let elementScore = 0;

    if (weapon.elements?.length) {
      elementScore = weapon.elements.reduce((sum: number, element: { type: string; damage: number }) => {
        const stars = weaknessMap.get(element.type) || 0;
        return sum + (element.damage || 0) * (stars + 1);
      }, 0);
    }

    const attackScore = weapon.attack?.raw || 0;
    return elementScore + attackScore;
  }

  getWeaponImagePath(weapon: Weapon): string {
    if (!weapon?.name) return 'assets/placeholder-weapon.png';

    if (weapon.type === 'great-sword' || weapon.type === 'long-sword') {
      return `assets/Weapon/Swords-1-2/${weapon.name}.png`;
    }
    return `assets/Weapon/${weapon.type}/${weapon.name}.png`;
  }

  handleWeaponImageError(event: Event, weapon: Weapon) {
    const img = event.target as HTMLImageElement;
    console.warn(`Removing weapon with broken image: ${weapon.name} (ID: ${weapon.id})`);

    // Remove the weapon from the bestWeapons array
    this.bestWeapons = this.bestWeapons.filter(w => w.id !== weapon.id);

    // Fallback to ensure UI consistency
    img.src = 'assets/placeholder-weapon.png';
    img.style.opacity = '1';
  }
  public formatWeaponName(name: string): string {
    return name
      .replace(/\sI+$/, '')    // Remove Roman numerals
      .replace(/\s\d+$/, '')   // Remove Arabic numbers
      .replace(/-/g, ' ');     // Keep hyphen replacement
  }

  private getCraftingMaterials(weaponName: string): string[] {
    // Exact match check
    if (WEAPON_MATERIALS[weaponName]) {
      return WEAPON_MATERIALS[weaponName];
    }

    // Handle numbered series
    const baseName = weaponName.replace(/ \d+$/, '');
    if (WEAPON_MATERIALS[baseName]) {
      return WEAPON_MATERIALS[baseName];
    }

    // Fallback for unknown weapons
    return ['Materials data not available'];
  }

  onWeaponImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.opacity = '1';
  }

  hasDropData(): boolean {
    return !!this.monster?.rewards?.length;
  }

  getDropsByType(type: string): DropDisplay[] {
    if (!this.hasDropData()) return [];

    return this.monster.rewards
      .filter((reward: MonsterReward) => {
        return reward.conditions.some((condition: Condition) =>
          condition.type.toLowerCase() === type.toLowerCase()
        );
      })
      .map((reward: MonsterReward) => {
        const matchingCondition = reward.conditions.find((cond: Condition) =>
          cond.type.toLowerCase() === type.toLowerCase()
        );
        return {
          item: reward.item,
          chance: matchingCondition?.chance || 0,
          conditions: matchingCondition?.rank || ''
        };
      });
  }
}
