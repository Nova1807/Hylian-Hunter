import { Component, EnvironmentInjector, inject, ViewChild } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  @ViewChild('tabs') tabsRef?: IonTabs;
  public activeTab: string = 'tab3'; // Standard-Tab
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {}

  tabChanged(event: { tab: string }) {
    this.activeTab = event.tab;
  }

  getButtonImage(buttonType: 'Home' | 'M' | 'Z'): string {
    // Der aktive Tab bestimmt den Ordner
    const folder = this.activeTab === 'tab3' ? 'Home' :
      this.activeTab === 'Monster-Hunter' ? 'Monster_Hunter' : 'LOZ';

    return `assets/Footer_Images/${folder}/${buttonType}.png`;
  }
}
