import { ReceivingService } from './../../../_services/receiving.service';
import { CommonService } from './../../../_services/common.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PurchaseorderPage } from './purchaseorder.page';

const routes: Routes = [
  {
    path: '',
    component: PurchaseorderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers   : [
      CommonService,
      ReceivingService
  ]
})
export class PurchaseorderPageRoutingModule {}
