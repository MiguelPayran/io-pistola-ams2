import { ModalDetailPage } from './modaldetail/modaldetail-page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ZoneSortPageRoutingModule } from './zonesort-routing.module';
import { ZoneSortPage } from './zonesort.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ZoneSortPageRoutingModule,
    IonicModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [ZoneSortPage, ModalDetailPage],
  entryComponents: [ModalDetailPage],
})
export class ZoneSortPageModule {}
