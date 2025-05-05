import { Component, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IonButtons, IonHeader, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle
  ]
})
export class HeaderComponent implements AfterViewInit {
  title = 'HylianHunter';
  activePage: string = 'default';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateHeader(event.urlAfterRedirects);
      }
    });
  }

  ngAfterViewInit() {
    // Erzwingt eine Neuberechnung der Styles nach dem Laden
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  updateHeader(url: string) {
    if (url.includes('tab3')) {
      this.activePage = 'tab3';
    } else if (url.includes('LOZ')) {
      this.activePage = 'LOZ';
    } else if (url.includes('Monster-Hunter')) {
      this.activePage = 'Monster-Hunter';
    } else {
      this.activePage = 'default';
    }
  }
}
