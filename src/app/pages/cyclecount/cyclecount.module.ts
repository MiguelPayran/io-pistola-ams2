import { ModalPage } from './modal-page';
import { SharedModule } from '@app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CycleCountPageRoutingModule } from './cyclecount-routing.module';
import { CycleCountPage } from './cyclecount.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    CycleCountPageRoutingModule
  ],
  declarations: [CycleCountPage, ModalPage],
  entryComponents: [ModalPage],
})
export class CycleCountPageModule {}
