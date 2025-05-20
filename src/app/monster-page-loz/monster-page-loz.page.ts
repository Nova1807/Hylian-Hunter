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
  IonBackButton, IonSpinner
} from '@ionic/angular/standalone';
import { LOZApiService } from '../LOZ.api/LOZ.api.service';
import {FormsModule} from "@angular/forms";

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
    FormsModule
  ],
  providers: [LOZApiService]
})
export class MonsterPageLozPage implements OnInit {
  monsters: any[] = [];
  loading = true;
  searchTerm: string = '';
  allMonsters: any[] = [];


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
      },
      error: (err) => {
        console.error('Error loading monsters:', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.monsters = [...this.allMonsters];
      return;
    }

    this.monsters = this.allMonsters.filter(monster =>
      monster.name.toLowerCase().includes(term)
    );
  }

  navigateToDetail(monsterId: string) {
    this.router.navigate(['/weapon-detail'], {
      queryParams: { id: monsterId },
      queryParamsHandling: 'merge'
    });
  }
}
