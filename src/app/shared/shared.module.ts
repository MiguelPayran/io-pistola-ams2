import { InputComponent } from './input/input';
import { AmsDirectivesModule } from './../../@ams/directives/directives';
import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LPComponent} from './lp/lp';
import { LocationComponent} from './location/location';
import {ItemComponent} from './item/item';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuantityComponent } from './quantity/quantity';
import { ZoneComponent } from './zone/zone';
import { ClientComponent } from './client/client';

@NgModule({
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AmsDirectivesModule
  ],
  declarations: [
  LPComponent, LocationComponent, ItemComponent, QuantityComponent, InputComponent, ZoneComponent, ClientComponent
  ],
  exports: [
    LPComponent, LocationComponent, ItemComponent, QuantityComponent, InputComponent, CommonModule, FormsModule, AmsDirectivesModule, ZoneComponent, ClientComponent, ReactiveFormsModule
  ]
})

export class SharedModule {}
