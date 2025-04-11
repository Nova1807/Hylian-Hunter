import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-weapon-page-loz',
  templateUrl: './weapon-page-loz.page.html',
  styleUrls: ['./weapon-page-loz.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class WeaponPageLozPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

export class WeaponPageLoz {
}
