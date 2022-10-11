import { OldPurchaseOrderPage } from './oldoldpurchaseorder.page';
import { ReceivingService } from './../../../_services/receiving.service';
import { CommonService } from './../../../_services/common.service';
import { ClientService } from './../../../_services/client.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: OldPurchaseOrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers   : [
      CommonService,
      ReceivingService,
      ClientService
  ]
})
export class OldPurchaseOrderPageRoutingModule {}
