import { Component, ViewChild } from '@angular/core';
import { IonTabBar, IonTabButton, IonTabs, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton]
})
export class TabsPage {
  @ViewChild('tabs') tabsRef?: IonTabs;
  activeTab = 'tab3';      // Home
  previousTab = 'tab3';

  constructor(private navCtrl: NavController) {}

  // Wird aufgerufen, wenn Ionic den aktiven Tab ändert
  tabChanged(event: { tab: string }) {
    this.previousTab = this.activeTab;
    this.activeTab = event.tab;
  }

  // Wählt das korrekte Footer-Icon je nach aktivem Tab
  getButtonImage(buttonType: 'Home' | 'M' | 'Z'): string {
    let folder: 'Home' | 'Monster_Hunter' | 'LOZ';

    switch (this.activeTab) {
      case 'tab3':
        folder = 'Home';
        break;
      case 'Monster-Hunter':
        folder = 'Monster_Hunter';
        break;
      case 'LOZ':
        folder = 'LOZ';
        break;
      default:
        folder = 'Home';
    }

    return `assets/Footer_Images/${folder}/${buttonType}.png`;
  }

  // Fängt Klicks auf die Tabs ab, um ggf. erst die Animation zu spielen
  handleTabClick(event: Event, targetTab: string) {
    // Wenn wir zu Monster-Hunter wechseln, und vorher Home oder LOZ aktiv war...
    if (targetTab === 'Monster-Hunter' && (this.activeTab === 'tab3' || this.activeTab === 'LOZ')) {
      event.preventDefault();
      this.navCtrl.navigateForward('/monster-hunter-animation', {
        state: { origin: this.activeTab }
      });
      return;
    }

    // Wenn wir zu LOZ wechseln, und vorher Home oder Monster-Hunter aktiv war...
    if (targetTab === 'LOZ' && (this.activeTab === 'tab3' || this.activeTab === 'Monster-Hunter')) {
      event.preventDefault();
      this.navCtrl.navigateForward('/loz-animation', {
        state: { origin: this.activeTab }
      });
      return;
    }

    // Für alle anderen Fälle Ionic normal weiternavigieren lassen
    // (kein preventDefault())
  }
}
