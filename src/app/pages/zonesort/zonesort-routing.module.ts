import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ZoneSortPage } from './zonesort.page';

const routes: Routes = [
  {
    path: '',
    component: ZoneSortPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ZoneSortPageRoutingModule {}
