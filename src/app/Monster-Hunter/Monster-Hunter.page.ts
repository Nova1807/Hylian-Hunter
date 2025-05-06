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
  levenshteinDistance(a: string, b: string): number {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = b[i - 1] === a[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // Deletion
          matrix[i][j - 1] + 1,      // Insertion
          matrix[i - 1][j - 1] + cost // Substitution
        );
      }
    }

    return matrix[b.length][a.length];
  }

  /** Wendet Suche + alle aktiven Filter an */
  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();

    let filtered = this.allMonsters.filter(monster => {
      // Suche nach Name (genauer Treffer oder leerer Suchterm)
      const nameMatch = term === '' || monster.name.toLowerCase().startsWith(term);

      // Filter: Typ
      const typeMatch = this.selectedFilters.type.length === 0 || this.selectedFilters.type.includes(monster.type);

      // Filter: Spezies
      const speciesMatch = this.selectedFilters.species.length === 0 || this.selectedFilters.species.includes(monster.species);

      // Filter: Elemente
      const elementsMatch = this.selectedFilters.elements.length === 0 ||
        (monster.elements && monster.elements.some((e: string) => this.selectedFilters.elements.includes(e)));

      // Filter: Schwächen
      const weaknessesMatch = this.selectedFilters.weaknesses.length === 0 ||
        (monster.weaknesses && monster.weaknesses.some((w: any) => this.selectedFilters.weaknesses.includes(w.element)));

      // Filter: Ailments
      const ailmentsMatch = this.selectedFilters.ailments.length === 0 ||
        (monster.ailments && monster.ailments.some((a: any) => this.selectedFilters.ailments.includes(a.name)));

      return nameMatch && typeMatch && speciesMatch && elementsMatch && weaknessesMatch && ailmentsMatch;
    });

    // Fuzzy-Suche, wenn kein exakter Name-Treffer
    if (filtered.length === 0 && term.length >= 2) {
      filtered = this.allMonsters.filter(monster =>
        this.levenshteinDistance(monster.name.toLowerCase(), term) <= 2
      );
    }

    this.filteredMonsters = filtered;
    this.currentIndex = this.batchSize;
    this.displayedMonsters = this.filteredMonsters.slice(0, this.currentIndex);

    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
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
