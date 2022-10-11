import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SortoutPage } from './sortout.page';

const routes: Routes = [
  {
    path: '',
    component: SortoutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SortoutPageRoutingModule {}
