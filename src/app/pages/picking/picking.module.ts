import { PickingMOPage } from './pickmo/pickingmo.page';
import { ModalMOPage } from './pickmo/modalmo-page';
import { ModalDetailTotePage } from './pickcart/modal-page';
import { ModalCC } from './modal-cc/modal-cc';
import { ModalClosePick } from './modal-closepick/modal-closepick';
import { ModalPage } from './pick/modal-page';
import { ModalTotes } from './pickcart/modal-totes/modal-totes';
import { SharedModule } from '@app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PickingPageRoutingModule } from './picking-routing.module';
import { PickingPage } from './pick/picking.page';
import { PickingCartPage } from './pickcart/pickingcart.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    PickingPageRoutingModule
  ],
  declarations: [PickingPage,PickingMOPage,PickingCartPage, ModalPage, ModalMOPage, ModalDetailTotePage, ModalClosePick, ModalCC, ModalTotes],
  entryComponents: [ModalPage, ModalMOPage,ModalDetailTotePage, ModalClosePick, ModalCC, ModalTotes],
})
export class PickingPageModule {}
