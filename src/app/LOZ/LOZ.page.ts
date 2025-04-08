import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Hier importieren
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonThumbnail, IonCardContent, IonCardTitle, IonCard, IonCardHeader, IonButton
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { HttpClientModule } from '@angular/common/http';
import { LOZApiService } from '../LOZ.api/LOZ.api.service';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-LOZ',
  templateUrl: 'LOZ.page.html',
  styleUrls: ['LOZ.page.scss'],
  standalone: true,
  imports: [
    CommonModule, // <-- Füge das hier hinzu
    IonHeader, IonToolbar, IonTitle, IonContent, HttpClientModule, IonList, IonCardContent, IonCardTitle, IonCard, IonCardHeader, IonButton, RouterLink
  ],
  providers: [LOZApiService]
})
export class LOZPage implements OnInit {
  monsters: any[] = [];

  constructor(private lOZApiService: LOZApiService) {}

  ngOnInit() {
    this.loadMonsters();
  }

  loadMonsters() {
    this.lOZApiService.getAllMonsters().subscribe((data: any) => {
      console.log('API Response:', data); // API-Daten prüfen
      this.monsters = data.data;
    });
  }
}
