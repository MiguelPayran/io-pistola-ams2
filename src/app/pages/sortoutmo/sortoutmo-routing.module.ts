import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SortoutMOPage } from './sortoutmo.page';

const routes: Routes = [
  {
    path: '',
    component: SortoutMOPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SortoutMOPageRoutingModule {}
