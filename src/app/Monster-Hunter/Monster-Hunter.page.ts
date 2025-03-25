import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonList,
  IonLabel,
  IonThumbnail
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { MonsterHunterApiService } from "../Monster-Hunter.api/Monster-Hunter.api.service";
import { HttpClient, HttpClientModule } from "@angular/common/http";

@Component({
  selector: 'app-Monster-Hunter',
  templateUrl: 'Monster-Hunter.page.html',
  styleUrls: ['Monster-Hunter.page.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, IonItem, IonList, HttpClientModule, IonLabel, IonThumbnail],
})
export class MonsterHunterPage implements OnInit {
  monsters: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMonsters();
  }

  loadMonsters() {
    this.http.get<any[]>('https://mhw-db.com/monsters').subscribe(
      (data) => {
        data.forEach((monster) => {
          if (monster.weaknesses) {
            monster.weaknesses.sort((a: any, b: any) => b.stars - a.stars);
          }
        });
        this.monsters = data;
      },
      (error) => {
        console.error('Fehler beim Laden der Monsterdaten:', error);
      }
    );
  }
}
