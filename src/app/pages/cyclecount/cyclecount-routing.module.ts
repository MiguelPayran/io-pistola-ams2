import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CycleCountPage } from './cyclecount.page';

const routes: Routes = [
  {
    path: '',
    component: CycleCountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CycleCountPageRoutingModule {}
