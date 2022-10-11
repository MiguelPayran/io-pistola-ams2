import { SharedModule } from '@app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PackingPageModule } from '@app/pages/packing/packing.module';
import { HospitalPackingPageRoutingModule } from './hospitalpacking-routing.module';
import { HospitalPackingPage } from './hospitalpacking.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    HospitalPackingPageRoutingModule,
    PackingPageModule
  ],
  declarations: [HospitalPackingPage],
  entryComponents: [],
})
export class HospitalPackingPageModule {}
