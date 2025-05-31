import { Component, NgIterable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButton, IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader, IonCardTitle,
  IonContent,
  IonHeader, IonInput, IonItem, IonLabel, IonList, IonRange, IonSearchbar, IonSelect, IonSelectOption,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { HttpClientModule } from "@angular/common/http";
import { Router, RouterLink } from "@angular/router";
import { LOZApiService } from "../LOZ.api/LOZ.api.service";

@Component({
  selector: 'app-weapon-page-loz',
  templateUrl: './weapon-page-loz.page.html',
  styleUrls: ['./weapon-page-loz.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    HttpClientModule, IonList, IonCardContent, IonCardTitle,
    IonCard, IonCardHeader, IonButton, RouterLink,
    IonSearchbar, IonButtons, IonBackButton, IonInput, IonLabel, IonItem, IonSelectOption, IonSelect, IonRange
  ],
  providers: [LOZApiService]
})
export class WeaponPageLozPage implements OnInit {
  weapons: any[] = [];
  allWeapons: any[] = [];

  searchTerm: string = '';
  selectedPlace: string = '';
  minAttack: number | null = null;
  minDefense: number | null = null;
  availablePlaces: string[] = [];
  showFilters: boolean = false;

  constructor(
    private lOZApiService: LOZApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadWeapons();
  }

  loadWeapons() {
    this.lOZApiService.getAllWeapons().subscribe((data: any) => {
      console.log('API Response:', data);

      this.allWeapons = data.data.map((w: any) => ({
        id: w.id,
        name: w.name,
        image: w.image,
        place: w.common_locations?.[0] || 'Unknown',
        attack: w.properties?.attack ?? 0,
        defense: w.properties?.defense ?? 0
      }));

      this.availablePlaces = [...new Set(this.allWeapons.map(w => w.place))];
      this.applyFilters();
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();

    this.weapons = this.allWeapons.filter(weapon => {
      const matchesSearch = weapon.name.toLowerCase().includes(term);
      const matchesPlace = this.selectedPlace ? weapon.place === this.selectedPlace : true;
      const matchesAttack = this.minAttack != null ? weapon.attack >= this.minAttack : true;
      const matchesDefense = this.minDefense != null ? weapon.defense >= this.minDefense : true;

      return matchesSearch && matchesPlace && matchesAttack && matchesDefense;
    });
  }

  toggleFilter() {
    this.showFilters = !this.showFilters;
  }
  resetFilters() {
    this.searchTerm = '';
    this.selectedPlace = '';
    this.minAttack = null;
    this.minDefense = null;
    this.applyFilters();
  }

  navigateToDetail(WeaponId: number) {
    this.router.navigate(['/weapon-detail'], {
      queryParams: { id: WeaponId },
      queryParamsHandling: 'merge'
    });
  }
}
