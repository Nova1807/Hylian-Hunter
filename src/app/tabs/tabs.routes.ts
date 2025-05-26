import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'Monster-Hunter',
        loadComponent: () => import('../Monster-Hunter/Monster-Hunter.page').then((m) => m.MonsterHunterPage),
      },
      {
        path: 'LOZ',
        loadComponent: () => import('../LOZ/LOZ.page').then((m) => m.LOZPage),
      },
      {
        path: 'tab3',
        loadComponent: () => import('../tab3/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: 'monster-hunter-animation',
        loadComponent: () => import('../Monster-hunter-animation/Monster-hunter-animation.page').then(m => m.MonsterHunterAnimationPage)
      },
      {
        path: 'loz-animation',
        loadComponent: () => import('../LOZ-animation/LOZ-animation.page').then(m => m.LOZAnimationPage)
      },
      {
        path: '',
        redirectTo: 'Monster-Hunter',
        pathMatch: 'full',
      },
    ],
  }
];
