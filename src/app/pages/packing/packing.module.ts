import { SharedModule } from '@app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PackingPageRoutingModule } from './packing-routing.module';
import { PackingPage } from './packing.page';
import { OrderModalPage } from './ordermodal-page';
import { AdCodePopOver } from './adcodepopover';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    PackingPageRoutingModule
  ],
  declarations: [PackingPage,OrderModalPage,AdCodePopOver],
  entryComponents: [OrderModalPage,AdCodePopOver],
})
export class PackingPageModule {}
