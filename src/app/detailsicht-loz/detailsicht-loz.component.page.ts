import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LOZApiService } from '../LOZ.api/LOZ.api.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-detailsicht-loz',
  templateUrl: './detailsicht-loz.component.page.html',
  styleUrls: ['./detailsicht-loz.component.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DetailsichtLozComponentPage implements OnInit {
  weapon: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private lozApi: LOZApiService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.lozApi.getWeaponById(id).subscribe({
          next: (response) => {
            this.weapon = response; // The full response object
            console.log('Formatted Data:', this.weapon);
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading weapon:', err);
            this.loading = false;
          }
        });
      }
    });
  }
}
