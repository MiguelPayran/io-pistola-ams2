import { ModalToteVeri } from './modal-toteveri/modal-toteveri';
import { SharedModule } from '@app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToteVeriPageRoutingModule } from './toteveri-routing.module';
import { ToteVeriPage } from './toteveri.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    ToteVeriPageRoutingModule
  ],
  declarations: [ToteVeriPage, ModalToteVeri],
  entryComponents: [ ModalToteVeri],
})
export class ToteVeriPageModule {}
