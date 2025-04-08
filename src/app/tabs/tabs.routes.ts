import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'Monster-Hunter',
        loadComponent: () =>
          import('../Monster-Hunter/Monster-Hunter.page').then((m) => m.MonsterHunterPage),
      },
      {
        path: 'LOZ',
        loadComponent: () =>
          import('../LOZ/LOZ.page').then((m) => m.LOZPage),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../tab3/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: '',
        redirectTo: '/tabs/Monster-Hunter',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab3',
    pathMatch: 'full',
  },
];
