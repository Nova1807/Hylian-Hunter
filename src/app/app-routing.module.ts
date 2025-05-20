import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'weapon-page-loz',
    loadComponent: () =>
      import('./weapon-page-loz/weapon-page-loz.page').then(m => m.WeaponPageLozPage)
  },
  {
    path: 'monster-page-loz',
    loadComponent: () =>
      import('./monster-page-loz/monster-page-loz.page').then(m => m.MonsterPageLozPage)
  },
  {
    path: 'subpage-monster-hunter',
    loadComponent: () =>
      import('./Subpage-monster-hunter/Subpage-monster-hunter.page').then(m => m.SubpageMonsterHunterPage)
  },
  {
    path: 'weapon-detail',
    loadComponent: () =>
      import('./detailsicht-loz/detailsicht-loz.component.page').then(m => m.DetailsichtLozComponentPage)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
