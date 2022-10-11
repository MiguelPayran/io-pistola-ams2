import { OldPurchaseOrderPageRoutingModule } from './oldpurchaseorder-routing.module';
import { OldPurchaseOrderPage } from './oldoldpurchaseorder.page';
import { SharedModule } from './../../../shared/shared.module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    OldPurchaseOrderPageRoutingModule
  ],
  declarations: [OldPurchaseOrderPage],
  entryComponents: [],
})
export class OldPurchaseOrderPageModule {

  enableBackdropDismiss = true;
  showBackdrop = true;
  shouldPropagate = true;

}
