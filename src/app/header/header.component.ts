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
  title = 'HylianHunter';
  activePage: string = 'default';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateHeader(event.urlAfterRedirects);
      }
    });
  }

  updateHeader(url: string) {
    if (url.includes('tab3')) {
      this.activePage = 'home';
    } else if (url.includes('LOZ')) {
      this.activePage = 'LOZ';
    } else if (url.includes('Monster-Hunter')) {
      this.activePage = 'monsters';
    } else {
      this.activePage = 'default';
    }
    console.log('Active Page:', this.activePage); // Debugging
  }
}
