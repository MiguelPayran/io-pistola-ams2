import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MoveToHospitalPage } from './movetohospital';

const routes: Routes = [
  {
    path: '',
    component: MoveToHospitalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MoveToHospitalRoutingModule {}
