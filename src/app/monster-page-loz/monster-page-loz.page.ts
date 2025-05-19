import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonCardContent,
  IonCardTitle,
  IonCard,
  IonCardHeader,
  IonButton,
  IonSearchbar
} from '@ionic/angular/standalone';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { LOZApiService } from '../LOZ.api/LOZ.api.service';

@Component({
  selector: 'app-monster-page-loz',
  templateUrl: './monster-page-loz.page.html',
  styleUrls: ['./monster-page-loz.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    HttpClientModule,
    IonList,
    IonCardContent,
    IonCardTitle,
    IonCard,
    IonCardHeader,
    IonButton,
    IonSearchbar
  ],
  providers: [LOZApiService]
})
export class MonsterPageLozPage implements OnInit {
  monsters: any[] = [];

  constructor(private lOZApiService: LOZApiService, private router: Router) {}

  ngOnInit() {
    this.loadMonsters();
  }

  loadMonsters() {
    this.lOZApiService.getAllMonsters().subscribe((data: any) => {
      console.log('API Response:', data); // API-Daten prüfen
      this.monsters = data.data;
    });
  }

  navigateToDetail(monsterId: number) {
    console.log('Navigiere zu Monster mit ID:', monsterId);
    this.router.navigate(['/detailsicht-loz'], {
      queryParams: { id: monsterId, type: 'monster' }
    });
  }
}
