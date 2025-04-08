import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonList,
  IonLabel, IonTabBar, IonTabButton, IonSearchbar, IonPopover, IonButton
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { MonsterHunterApiService } from "../Monster-Hunter.api/Monster-Hunter.api.service";
import { HttpClient, HttpClientModule } from "@angular/common/http";

@Component({
  selector: 'app-Monster-Hunter',
  templateUrl: 'Monster-Hunter.page.html',
  styleUrls: ['Monster-Hunter.page.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, IonItem, IonList, HttpClientModule, IonLabel, IonTabBar, IonTabButton, IonSearchbar, IonPopover, IonButton],
})
export class MonsterHunterPage implements OnInit {
  monsters: any[] = [];
  weapons: any[] = []; // <-- Array to store weapons data

  constructor(private monsterApiService: MonsterHunterApiService) {}

  ngOnInit() {
    this.loadMonsters();
    this.loadWeapons(); // <-- Load weapons on initialization
  }

  loadMonsters() {
    this.monsterApiService.getAllMonsters().subscribe(
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

  loadWeapons() {
    this.monsterApiService.getAllWeapons().subscribe(
      (data) => {
        this.weapons = data.filter(weapon => weapon.name.endsWith('1'))
          .map(weapon => ({
            ...weapon,
            displayName: weapon.name.slice(0, -1) // Remove the "1" from display name
          }));
      },
      (error) => {
        console.error('Error fetching weapons:', error);
      }
    );
  }

  getWeaponImagePath(weapon: any): string {

    if (weapon.type === 'great-sword' || weapon.type === 'long-sword') {
      return `Weapon/Swords-1-2/${weapon.name}.png`; // Special case for these two
    }

    return `Weapon/${weapon.type}/${weapon.name}.png`; // Every other weapon type uses its own folder
  }
}
