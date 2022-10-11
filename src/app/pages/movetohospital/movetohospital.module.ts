import { MoveToHospitalRoutingModule } from './movetohospital-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MoveToHospitalPage } from './movetohospital';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    MoveToHospitalRoutingModule
  ],
  declarations: [MoveToHospitalPage]
})
export class MoveToHospitalPageModule {}
