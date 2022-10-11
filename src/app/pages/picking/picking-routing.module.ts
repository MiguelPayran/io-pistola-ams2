import { PickingMOPage } from './pickmo/pickingmo.page';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PickingPage } from './pick/picking.page';
import { PickingCartPage } from './pickcart/pickingcart.page';

const routes: Routes = [
  {
    path: 'pick',
    component: PickingPage
  },
  {
    path: 'pickmo',
    component: PickingMOPage
  },
  {
    path: 'cart',
    component: PickingCartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PickingPageRoutingModule {}
