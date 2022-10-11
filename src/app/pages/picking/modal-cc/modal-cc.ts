import { LPService } from '@app/_services/lp.service';
import { WorkQService } from '@app/_services/workq.service';
import { ToastService } from '@app/_services/toast.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  templateUrl: './modal-cc.html',
  selector: 'modal-cc',
  styleUrls: ['./modal-cc.scss'],
})
export class ModalCC implements OnInit {
  @ViewChild('quantity', { static: true }) quantityRef;

  @Input() data: any;
  formGroup: FormGroup;
  message;
  numAttemps = 0;
  quantity = 0;
  item;

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private workQService: WorkQService,
    private modalController: ModalController,
    private lpService: LPService) {
  }


  ngOnInit() {
    console.log(this.data);
    this.formGroup = this.formBuilder.group({
      quantity: '',
    });
    this.setFocus('quantity');

    Promise.resolve().then(() =>
      this.lpService.getItemsByLocationOrLP(this.data.location, null, this.data.displayItemNumber).then(
        (result) => {
          console.log(result);
          this.quantity = result.count == 1 ? result.data[0].actualQty : 0;
          this.item = result.count == 1 ? result.data[0].itemNumber : null;
        }));
  }


  getValueInput(input) {
    return this.formGroup.controls[input].value;
  }


  setValueInput(input, value) {
    this.formGroup.get(input).setValue(value);
  }


  ngAfterViewInit() {
  }


  dismiss(data?) {
    this.modalController.dismiss(data);
  }


  validateQuantity(e) {
    console.log(e);
    if (e.status === 'success') {
      if (this.getValueInput('quantity') == this.quantity) {
        this.dismiss(this.data);
        return;
      }

      if (this.numAttemps == 1) {
        this.workQService.createWork(
          {
            workType: "08",
            sourceLocation: this.data.location,
            clientId: this.data.clientId,
            action: this.getValueInput('quantity') < this.quantity ? "SHORT" : null,
            itemNumber: this.item
          }
        ).then(result => {

          this.dismiss(this.data);
        });
      } else {
        this.setValueInput('quantity', '');
        this.setFocus('quantity');
        this.toastService.changeMessage({ color: 'danger', message: 'Enter quantity again', duration: 2000 });
        this.numAttemps++;
      }

    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data, duration: 2000 });
    }
  }

  setFocus(field: string) {
    let reference;
    switch (field) {
      case 'quantity': {
        reference = this.quantityRef;
        this.message = "Enter remain quantity for :<b>" + this.data.displayItemNumber + "</b>";
        break;
      }
    }
    setTimeout(() => {
      if (reference != null) {
        reference.setFocus();
      }
    }, 300);
  }

}
