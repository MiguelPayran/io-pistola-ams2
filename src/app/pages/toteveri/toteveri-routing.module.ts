import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ToteVeriPage } from './toteveri.page';

const routes: Routes = [
  {
    path: '',
    component: ToteVeriPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ToteVeriPageRoutingModule {}
