import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HospitalPackingPage } from './hospitalpacking.page';

const routes: Routes = [
  {
    path: '',
    component: HospitalPackingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HospitalPackingPageRoutingModule {}
