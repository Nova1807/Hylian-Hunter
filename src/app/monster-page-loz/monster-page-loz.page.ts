import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-monster-page-loz',
  templateUrl: './monster-page-loz.page.html',
  styleUrls: ['./monster-page-loz.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MonsterPageLozPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
