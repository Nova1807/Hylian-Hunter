import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonCard, IonCardContent,
  IonSkeletonText, IonButton
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MonsterHunterApiService } from "../Monster-Hunter.api/Monster-Hunter.api.service";

@Component({
  selector: 'app-Subpage-Monster-Hunter',
  templateUrl: 'Subpage-monster-hunter.page.html',
  styleUrls: ['Subpage-monster-hunter.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonCard, IonCardContent,
    IonSkeletonText, IonButton
  ],
})
export class SubpageMonsterHunterPage implements OnInit {
  monster: any;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private monsterApiService: MonsterHunterApiService
  ) {}

  // CHANGE 1: Updated ngOnInit to use queryParams instead of paramMap
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadMonster(+id); // Convert string to number
      } else {
        console.warn('No monster ID provided in query parameters');
        // Optional: Add redirect or error handling here
      }
    });
  }

  // CHANGE 2: Enhanced loadMonster with better error handling
  loadMonster(id: number) {
    this.isLoading = true;
    this.monsterApiService.getMonsterById(id).subscribe({
      next: (data) => {
        this.monster = data;
        this.processMonsterData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading monster:', err);
        this.isLoading = false;
        // Optional: Add user-friendly error message here
      }
    });
  }

  // CHANGE 3: Extracted monster data processing to separate method
  private processMonsterData() {
    if (this.monster?.weaknesses) {
      this.monster.weaknesses.sort((a: any, b: any) => b.stars - a.stars);
    }
  }

  // CHANGE 4: Added image error handling
  getImagePath(): string {
    if (!this.monster?.name) return 'assets/placeholder-monster.png';
    return `assets/Monster-Images/${this.monster.name}.png`;
  }

  // NEW METHOD: Add this for image error handling
  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-monster.png';
  }
}
