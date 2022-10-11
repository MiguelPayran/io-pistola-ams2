import { HospitalPackingPageModule } from '../hospitalpacking/hospitalpacking.module';
import { SingleLinePackingRoutingModule } from './singlelinepacking-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SingleLinePackingPage } from './singlelinepacking';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    SingleLinePackingRoutingModule,
    HospitalPackingPageModule
  ],
  declarations: [SingleLinePackingPage],
  entryComponents: [],
})
export class SingleLinePackingPageModule {}
