import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LOZApiService } from '../LOZ.api/LOZ.api.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-detailsicht-loz',
  templateUrl: './detailsicht-loz.component.page.html',
  styleUrls: ['./detailsicht-loz.component.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DetailsichtLozComponentPage implements OnInit {
  weapon: any;
  monster: any;
  loading = true;
  currentView:'weapon'|'monster' = 'weapon';

  constructor(
    private route: ActivatedRoute,
    private lozApi: LOZApiService,
    private location: Location,
  ) {}

  goBack() {
    this.location.back(); // Zurück zur vorherigen Seite
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      const type = params['type']; // <-- Neu: Typ auslesen

      if (id && type === 'weapon') {
        this.lozApi.getWeaponById(id).subscribe({
          next: (response) => {
            this.weapon = response;
            this.loading = false;
          },
          error: (err) => {
            console.error('Fehler beim Laden der Waffe:', err);
            this.loading = false;
          }
        });
      } else if (id && type === 'monster') {
        this.lozApi.getMonsterById(id).subscribe({
          next: (response) => {
            this.monster = response;
            this.loading = false;
          },
          error: (err) => {
            console.error('Fehler beim Laden des Monsters:', err);
            this.loading = false;
          }
        });
      } else {
        console.warn('Kein gültiger Typ oder keine ID übergeben');
        this.loading = false;
      }
    });
  }
}
