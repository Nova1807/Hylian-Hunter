import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import {IonButtons, IonHeader, IonTitle, IonToolbar} from "@ionic/angular/standalone";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle
  ]
})
export class HeaderComponent {
  headerColor = '#ffffff'; // default color
  title = 'My App';         // default title
  activePage: 'default' | undefined;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateHeader(event.urlAfterRedirects);
      }
    });
  }

  updateHeader(url: string) {
    if (url.includes('tab3')) {
      this.headerColor = '#4CAF50'; // green
      this.title = 'Home';
    } else if (url.includes('LOZ')) {
      this.headerColor = '#2196F3'; // blue
      this.title = 'Weapons';
    } else if (url.includes('Monster-Hunter')) {
      this.headerColor = '#F44336'; // red
      this.title = 'Monsters';
    } else {
      this.headerColor = '#9E9E9E'; // grey
      this.title = 'My App';
    }
  }
}
