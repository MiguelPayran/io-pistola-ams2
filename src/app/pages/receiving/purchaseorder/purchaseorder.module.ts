import { SharedModule } from './../../../shared/shared.module';

import { ModalPage } from './modal-page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseorderPageRoutingModule } from './purchaseorder-routing.module';

import { PurchaseorderPage } from './purchaseorder.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    PurchaseorderPageRoutingModule
  ],
  declarations: [PurchaseorderPage, ModalPage],
  entryComponents: [ModalPage],
})
export class PurchaseorderPageModule {

  enableBackdropDismiss = true;
  showBackdrop = true;
  shouldPropagate = true;

}
