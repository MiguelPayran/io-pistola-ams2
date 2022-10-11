import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BBSortPageRoutingModule } from './bbsort-routing.module';
import { BBSortPage } from './bbsort.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    BBSortPageRoutingModule,
    IonicModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [BBSortPage]
})
export class BBSortPageModule {}
