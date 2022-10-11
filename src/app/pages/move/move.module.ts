import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MovePageRoutingModule } from './move-routing.module';
import { MovePage } from './move.page';
import { SharedModule } from '@app/shared/shared.module';
import { MoveLpComponent } from './movelp/movelp';
import { MoveItemComponent } from './moveitem/moveitem';
import { AdjustComponent } from './adjust/adjust';
import { ItemModalPage } from './moveitem/item-modal';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    MovePageRoutingModule,
    SharedModule
  ],
  declarations: [MovePage,MoveLpComponent,MoveItemComponent,AdjustComponent,ItemModalPage],
  entryComponents: [ItemModalPage],
})
export class MovePageModule {}
