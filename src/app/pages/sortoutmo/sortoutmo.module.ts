import { ModalContainer } from './modal-cart/modal-container';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SortoutMOPageRoutingModule } from './sortoutmo-routing.module';
import { SortoutMOPage } from './sortoutmo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SortoutMOPageRoutingModule,
    IonicModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [SortoutMOPage, ModalContainer],
  entryComponents: [ModalContainer],
})
export class SortoutMOPageModule {}
