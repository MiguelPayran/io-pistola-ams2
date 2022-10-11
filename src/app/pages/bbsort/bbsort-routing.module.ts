import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BBSortPage } from './bbsort.page';

const routes: Routes = [
  {
    path: '',
    component: BBSortPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BBSortPageRoutingModule {}
