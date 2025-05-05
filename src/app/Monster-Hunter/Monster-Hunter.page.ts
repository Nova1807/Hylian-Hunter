import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonList,
  IonLabel, IonTabBar, IonTabButton, IonSearchbar, IonPopover,
  IonButton, IonInfiniteScroll, IonInfiniteScrollContent, IonSkeletonText,
  IonSelect, IonSelectOption, IonListHeader
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { MonsterHunterApiService } from "../Monster-Hunter.api/Monster-Hunter.api.service";
import { HttpClientModule } from "@angular/common/http";
import { Router, RouterLink } from "@angular/router";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-Monster-Hunter',
  templateUrl: 'Monster-Hunter.page.html',
  styleUrls: ['Monster-Hunter.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    ExploreContainerComponent, IonItem, IonList,
    HttpClientModule, IonLabel, IonTabBar, IonTabButton,
    IonSearchbar, IonPopover, IonButton,
    IonInfiniteScroll, IonInfiniteScrollContent,
    IonSkeletonText, IonSelect, IonSelectOption,
    RouterLink, HeaderComponent, IonListHeader
  ],
})
export class MonsterHunterPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  allMonsters: any[] = [];
  filteredMonsters: any[] = [];
  displayedMonsters: any[] = [];
  weapons: any[] = [];
  batchSize = 6;
  currentIndex = 0;
  isLoading = true;
  skeletonItems = new Array(6);

  // Suche & Filter
  searchTerm: string = '';
  filterOptions = {
    types: ['small', 'large'],
    species: [] as string[],
    elements: [] as string[],
    weaknesses: [] as string[],
    locations: [] as string[],
    ailments: [] as string[]
  };
  selectedFilters = {
    type: [] as string[],
    species: [] as string[],
    elements: [] as string[],
    weaknesses: [] as string[],
    locations: [] as string[],
    ailments: [] as string[]
  };

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
        data.forEach((m: any) => {
          if (m.weaknesses) {
            m.weaknesses.sort((a: any, b: any) => b.stars - a.stars);
          }
        });
        this.allMonsters = data;
        this.initFilterOptions();
        this.applyFilters();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading monsters:', error);
        this.isLoading = false;
      }
    );
  }

  /** Initialisiert alle möglichen Filterwerte aus den geladenen Monstern */
  initFilterOptions() {
    const set = {
      species: new Set<string>(),
      elements: new Set<string>(),
      weaknesses: new Set<string>(),
      locations: new Set<string>(),
      ailments: new Set<string>()
    };
    this.allMonsters.forEach(m => {
      set.species.add(m.species);
      m.elements?.forEach((e: string) => set.elements.add(e));
      m.weaknesses?.forEach((w: any) => set.weaknesses.add(w.element));
      m.locations?.forEach((loc: any) => set.locations.add(loc.name));
      m.ailments?.forEach((a: any) => set.ailments.add(a.name));
    });
    this.filterOptions.species   = Array.from(set.species).sort();
    this.filterOptions.elements  = Array.from(set.elements).sort();
    this.filterOptions.weaknesses = Array.from(set.weaknesses).sort();
    this.filterOptions.locations = Array.from(set.locations).sort();
    this.filterOptions.ailments  = Array.from(set.ailments).sort();
  }

  /** Wendet Suche + alle aktiven Filter an */
  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();

    // 1) Alle Monster nach Suchterm & Filterkriterien filtern
    this.filteredMonsters = this.allMonsters.filter(m => {
      const matchesSearch =
        !term ||
        m.name.toLowerCase().includes(term) ||
        (m.description?.toLowerCase().includes(term));

      const matchType     = !this.selectedFilters.type.length    || this.selectedFilters.type.includes(m.type);
      const matchSpecies  = !this.selectedFilters.species.length || this.selectedFilters.species.includes(m.species);
      const matchElements = !this.selectedFilters.elements.length || m.elements?.some((e: string) => this.selectedFilters.elements.includes(e));
      const matchWeak     = !this.selectedFilters.weaknesses.length || m.weaknesses?.some((w: any) => this.selectedFilters.weaknesses.includes(w.element));
      const matchLoc      = !this.selectedFilters.locations.length || m.locations?.some((l: any) => this.selectedFilters.locations.includes(l.name));
      const matchAil      = !this.selectedFilters.ailments.length || m.ailments?.some((a: any) => this.selectedFilters.ailments.includes(a.name));

      return matchesSearch && matchType && matchSpecies && matchElements && matchWeak && matchLoc && matchAil;
    });

    // Infinite Scroll wieder aktivieren
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }

    // 2) Erste Seite befüllen
    this.currentIndex = this.batchSize;
    this.displayedMonsters = this.filteredMonsters.slice(0, this.currentIndex);
  }

  /** Reset aller Filter und Suche */
  resetFilters() {
    this.searchTerm = '';
    Object.keys(this.selectedFilters).forEach(key => {
      (this.selectedFilters as any)[key] = [];
    });
    this.applyFilters();
  }

  loadMoreMonsters(event: any) {
    setTimeout(() => {
      const nextBatch = this.filteredMonsters.slice(
        this.currentIndex,
        this.currentIndex + this.batchSize
      );
      this.displayedMonsters = [...this.displayedMonsters, ...nextBatch];
      this.currentIndex += nextBatch.length;
      event.target.complete();
      if (this.currentIndex >= this.filteredMonsters.length) {
        event.target.disabled = true;
      }
    }, 800);
  }

  onImageLoad(event: Event) {
    (event.target as HTMLImageElement).style.opacity = '1';
  }

  onImageError(event: Event, monster: any) {
    const img = event.target as HTMLImageElement;
    console.error(`Error loading image for ${monster.name}`);
    img.src = 'assets/placeholder-monster.png';
    img.style.opacity = '1';
  }

  loadWeapons() {
    this.monsterApiService.getAllWeapons().subscribe(
      (data) => {
        this.weapons = data.filter(w => w.name.endsWith('1'))
          .map(w => ({ ...w, displayName: w.name.slice(0, -1) }));
      },
      (error) => console.error('Error fetching weapons:', error)
    );
  }

  getWeaponImagePath(weapon: any): string {
    if (weapon.type === 'great-sword' || weapon.type === 'long-sword') {
      return `Weapon/Swords-1-2/${weapon.name}.png`;
    }
    return `Weapon/${weapon.type}/${weapon.name}.png`;
  }
}
