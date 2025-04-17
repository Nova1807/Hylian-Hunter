import {Component, NgIterable, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader, IonCardTitle,
  IonContent,
  IonHeader, IonList, IonSearchbar,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import {HttpClientModule} from "@angular/common/http";
import {RouterLink} from "@angular/router";
import {LOZApiService} from "../LOZ.api/LOZ.api.service";
@Component({
  selector: 'app-weapon-page-loz',
  templateUrl: './weapon-page-loz.page.html',
  styleUrls: ['./weapon-page-loz.page.scss'],
  standalone: true,
  imports: [
    CommonModule, // <-- Füge das hier hinzu
    IonHeader, IonToolbar, IonTitle, IonContent, HttpClientModule, IonList, IonCardContent, IonCardTitle, IonCard, IonCardHeader, IonButton, RouterLink, IonSearchbar
  ],providers: [LOZApiService]
})
export class WeaponPageLozPage implements OnInit {
  weapons: any[] = [];

  constructor(private lOZApiService: LOZApiService) {
  }

  ngOnInit() {
    this.loadWeapons();
  }
  loadWeapons() {
    this.lOZApiService.getAllWeapons().subscribe((data: any) => {
      console.log('API Response:', data); // API-Daten prüfen
      this.weapons = data.data;
    });
  }
}

export class WeaponPageLoz {
}

