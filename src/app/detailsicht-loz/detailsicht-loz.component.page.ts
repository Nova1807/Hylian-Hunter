import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LOZApiService } from '../../LOZ.api/LOZ.api.service';
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.lozApi.getWeaponById(id).subscribe({
        next: (data) => {
          this.weapon = data.data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading weapon:', err);
          this.loading = false;
        }
      });
    }
  }
}
