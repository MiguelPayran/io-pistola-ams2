import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuditPage } from './audit';

const routes: Routes = [
  {
    path: '',
    component: AuditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditPageRoutingModule { }
