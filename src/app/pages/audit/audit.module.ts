import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuditPage } from './audit';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { AuditPageRoutingModule } from './audit-routing.module';
import { SharedModule } from '@app/shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AuditPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
    ],
  declarations: [AuditPage],
  entryComponents: [AuditPage],
})
export class AuditModule {}
