import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SingleLinePackingPage } from './singlelinepacking';

const routes: Routes = [
  {
    path: '',
    component: SingleLinePackingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SingleLinePackingRoutingModule {}
