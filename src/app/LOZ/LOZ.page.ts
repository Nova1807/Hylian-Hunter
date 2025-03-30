import {Component, OnInit} from '@angular/core';
import {IonHeader, IonToolbar, IonTitle, IonContent, IonItem} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {LOZApiService} from "../LOZ.api/LOZ.api.service";

@Component({
  selector: 'app-LOZ',
  templateUrl: 'LOZ.page.html',
  styleUrls: ['LOZ.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, HttpClientModule, IonItem]
})
export class LOZPage implements OnInit {

  constructor(private lOZApiService:LOZApiService) {}
   ngOnInit() {
    this.loadMonsters();
  }
  loadMonsters() {
    this.lOZApiService.getAllMonsters().subscribe()
  }

}
