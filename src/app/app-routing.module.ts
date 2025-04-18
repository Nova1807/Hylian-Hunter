// app-routing.module.ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { WeaponPageLoz } from './weapon-page-loz/weapon-page-loz.page';
import { MonsterPageLoz } from './monster-page-loz/monster-page-loz.page';
import {SubpageMonsterHunterPage } from './Subpage-monster-hunter/Subpage-monster-hunter.page';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'weapon-page-loz',
    component: WeaponPageLoz
  },
  {
    path: 'monster-page-loz',
    component: MonsterPageLoz
  },
  {
    path: 'subpage-monster-hunter',
    component: SubpageMonsterHunterPage
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
