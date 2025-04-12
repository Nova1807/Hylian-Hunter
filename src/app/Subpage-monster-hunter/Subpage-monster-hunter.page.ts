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
  bestWeapons: any[] = [];
  currentView: 'monster' | 'weapon' = 'monster';
  selectedWeapon: any = null;

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
        console.log('Monster rewards data:', this.monster?.rewards); // Debug logging
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

  showWeapon(weapon: any) {
    this.selectedWeapon = weapon;
    this.currentView = 'weapon';
    history.pushState(
      { view: 'weapon', weaponId: weapon.id },
      '',
      this.location.path()
    );
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

  private calculateBestWeapons(weapons: any[]) {
    if (!this.monster?.weaknesses || !weapons) return;

    const weaknessMap = new Map<string, number>(
      this.monster.weaknesses.map((w: { element: string; stars: number }) => [w.element, w.stars])
    );

    this.bestWeapons = weapons
      .filter(weapon => weapon.name.endsWith('1'))
      .map(weapon => ({
        ...weapon,
        displayName: this.formatWeaponName(weapon.name),
        score: this.calculateWeaponScore(weapon, weaknessMap)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }

  private calculateWeaponScore(weapon: any, weaknessMap: Map<string, number>): number {
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

  getWeaponImagePath(weapon: any): string {
    if (!weapon?.name) return 'assets/placeholder-weapon.png';

    if (weapon.type === 'great-sword' || weapon.type === 'long-sword') {
      return `assets/Weapon/Swords-1-2/${weapon.name}.png`;
    }
    return `assets/Weapon/${weapon.type}/${weapon.name}.png`;
  }

  handleWeaponImageError(event: Event, weapon: any) {
    const img = event.target as HTMLImageElement;
    console.error(`Error loading weapon image for ${weapon.name}`);
    img.src = 'assets/placeholder-weapon.png';
    img.style.opacity = '1';
  }

  private formatWeaponName(name: string): string {
    return name.slice(0, -1).replace(/-/g, ' ');
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
