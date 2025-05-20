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
  entry: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private lozApi: LOZApiService,
    private location: Location,
  ) {}

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.lozApi.getEntryById(id).subscribe({
          next: (response) => {
            this.entry = response.data;
            console.log('Entry Data:', this.entry);
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading entry:', err);
            this.loading = false;
          }
        });
      }
    });
  }
}
