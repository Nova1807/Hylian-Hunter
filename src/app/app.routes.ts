import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./animation/animation.page').then(m => m.AnimationPage)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'weapon-page-loz',
    loadComponent: () => import('./weapon-page-loz/weapon-page-loz.page').then(m => m.WeaponPageLozPage)
  },
  {
    path: 'monster-page-loz',
    loadComponent: () => import('./monster-page-loz/monster-page-loz.page').then(m => m.MonsterPageLozPage)
  },
  {
    path: 'subpage-monster-hunter',
    loadComponent: () => import('./Subpage-monster-hunter/Subpage-monster-hunter.page').then(m => m.SubpageMonsterHunterPage)
  },
  {
    path: 'weapon-detail',
    loadComponent: () => import('./detailsicht-loz/detailsicht-loz.component.page').then(m => m.DetailsichtLozComponentPage)
  },
  {
    path: 'monster-hunter-animation',
    loadComponent: () => import('./Monster-hunter-animation/Monster-hunter-animation.page').then(m => m.MonsterHunterAnimationPage)
  },
  {
    path: 'loz-animation',
    loadComponent: () => import('./LOZ-animation/LOZ-animation.page').then(m => m.LOZAnimationPage)
  }
];
