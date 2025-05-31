import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton, IonSpinner, IonButton
} from '@ionic/angular/standalone';
import { LOZApiService } from '../LOZ.api/LOZ.api.service';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-monster-page-loz',
  templateUrl: './monster-page-loz.page.html',
  styleUrls: ['./monster-page-loz.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButtons,
    IonBackButton,
    IonSpinner,
    IonButton,
    FormsModule
  ],
  providers: [LOZApiService]
})
export class MonsterPageLozPage implements OnInit {
  monsters: any[] = [];
  allMonsters: any[] = [];
  loading = true;

  searchTerm: string = '';
  showFilters = false;

  selectedPlace: string = '';
  selectedDrop: string = '';

  availablePlaces: string[] = [];
  availableDrops: string[] = [];

  constructor(
    private lozApiService: LOZApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMonsters();
  }

  loadMonsters() {
    this.lozApiService.getAllMonsters().subscribe({
      next: (data: any) => {
        this.allMonsters = data.data;
        this.monsters = [...this.allMonsters];
        this.loading = false;

        this.extractFilterOptions();
      },
      error: (err) => {
        console.error('Error loading monsters:', err);
        this.loading = false;
      }
    });
  }

  extractFilterOptions() {
    const placesSet = new Set<string>();
    const dropsSet = new Set<string>();

    this.allMonsters.forEach(monster => {
      // common_locations is array or null
      if (monster.common_locations && Array.isArray(monster.common_locations)) {
        monster.common_locations.forEach((place: string) => {
          if (place) placesSet.add(place);
        });
      }

      // drops is array or null
      if (monster.drops && Array.isArray(monster.drops)) {
        monster.drops.forEach((drop: string) => {
          if (drop) dropsSet.add(drop);
        });
      }
    });

    this.availablePlaces = Array.from(placesSet).sort();
    this.availableDrops = Array.from(dropsSet).sort();
  }

  toggleFilter() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    this.monsters = this.allMonsters.filter(monster => {
      const matchesSearch = monster.name.toLowerCase().includes(term);

      const matchesPlace = this.selectedPlace
        ? (monster.common_locations ?? []).includes(this.selectedPlace)
        : true;

      const matchesDrop = this.selectedDrop
        ? (monster.drops ?? []).includes(this.selectedDrop)
        : true;

      return matchesSearch && matchesPlace && matchesDrop;
    });
  }

  resetFilters() {
    this.selectedPlace = '';
    this.selectedDrop = '';
    this.searchTerm = '';
    this.monsters = [...this.allMonsters];
    this.showFilters = false;
  }

  navigateToDetail(monsterId: string) {
    this.router.navigate(['/weapon-detail'], {
      queryParams: { id: monsterId },
      queryParamsHandling: 'merge'
    });
  }
}
