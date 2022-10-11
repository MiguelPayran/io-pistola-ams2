import { ModalCart } from './modal-cart/modal-cart';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SortoutPageRoutingModule } from './sortout-routing.module';
import { SortoutPage } from './sortout.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SortoutPageRoutingModule,
    IonicModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [SortoutPage, ModalCart],
  entryComponents: [ModalCart],
})
export class SortoutPageModule {}
