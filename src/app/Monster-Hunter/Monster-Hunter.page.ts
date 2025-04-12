import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonList,
  IonLabel, IonTabBar, IonTabButton, IonSearchbar, IonPopover,
  IonButton, IonInfiniteScroll, IonInfiniteScrollContent, IonSkeletonText
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { MonsterHunterApiService } from "../Monster-Hunter.api/Monster-Hunter.api.service";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-Monster-Hunter',
  templateUrl: 'Monster-Hunter.page.html',
  styleUrls: ['Monster-Hunter.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    ExploreContainerComponent, IonItem, IonList,
    HttpClientModule, IonLabel, IonTabBar, IonTabButton,
    IonSearchbar, IonPopover, IonButton,
    IonInfiniteScroll, IonInfiniteScrollContent,
    IonSkeletonText, RouterLink
  ],
})
export class MonsterHunterPage implements OnInit {
  allMonsters: any[] = [];
  displayedMonsters: any[] = [];
  weapons: any[] = [];
  batchSize = 6;
  currentIndex = 0;
  isLoading = true;
  skeletonItems = new Array(6);

  constructor(
    private monsterApiService: MonsterHunterApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMonsters();
    this.loadWeapons();
  }

  navigateToDetail(monsterId: number) {
    this.router.navigate(['/subpage-monster-hunter'], {
      queryParams: { id: monsterId },
      queryParamsHandling: 'merge'
    });
  }

  loadMonsters() {
    this.isLoading = true;
    this.monsterApiService.getAllMonsters().subscribe(
      (data) => {
        data.forEach((monster) => {
          if (monster.weaknesses) {
            monster.weaknesses.sort((a: any, b: any) => b.stars - a.stars);
          }
        });

        this.allMonsters = data;
        this.displayedMonsters = this.allMonsters.slice(0, this.batchSize);
        this.currentIndex = this.batchSize;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading monsters:', error);
        this.isLoading = false;
      }
    );
  }

  loadMoreMonsters(event: any) {
    setTimeout(() => {
      const nextBatch = this.allMonsters.slice(
        this.currentIndex,
        this.currentIndex + this.batchSize
      );

      this.displayedMonsters = [...this.displayedMonsters, ...nextBatch];
      this.currentIndex += nextBatch.length;

      event.target.complete();

      if (this.currentIndex >= this.allMonsters.length) {
        event.target.disabled = true;
      }
    }, 800);
  }

  onImageLoad(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.opacity = '1';
  }

  onImageError(event: Event, monster: any) {
    const imgElement = event.target as HTMLImageElement;
    console.error(`Error loading image for ${monster.name}`);
    imgElement.src = 'assets/placeholder-monster.png';
    imgElement.style.opacity = '1';
  }

  loadWeapons() {
    this.monsterApiService.getAllWeapons().subscribe(
      (data) => {
        this.weapons = data.filter(weapon => weapon.name.endsWith('1'))
          .map(weapon => ({
            ...weapon,
            displayName: weapon.name.slice(0, -1)
          }));
      },
      (error) => {
        console.error('Error fetching weapons:', error);
      }
    );
  }

  getWeaponImagePath(weapon: any): string {
    if (weapon.type === 'great-sword' || weapon.type === 'long-sword') {
      return `Weapon/Swords-1-2/${weapon.name}.png`;
    }
    return `Weapon/${weapon.type}/${weapon.name}.png`;
  }
}
