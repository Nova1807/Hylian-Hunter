import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'weapon-page-loz',
    loadComponent: () => import('./weapon-page-loz/weapon-page-loz.page').then( m => m.WeaponPageLozPage)
  },
  {
    path: 'monster-page-loz',
    loadComponent: () => import('./monster-page-loz/monster-page-loz.page').then( m => m.MonsterPageLozPage)
  },
  {
    path: 'subpage-monster-hunter',
    loadComponent: () => import('./Subpage-monster-hunter/Subpage-monster-hunter.page').then( m => m.SubpageMonsterHunterPage)
  },

];
