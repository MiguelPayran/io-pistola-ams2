import { ToastService } from '@app/_services/toast.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  templateUrl: './modal-totes.html',
  selector: 'modal-totes',
  styleUrls: ['./modal-totes.scss'],
})
export class ModalTotes implements OnInit {
  @ViewChild('tote', { static: true }) toteRef;
  @Input() data: any;

  formGroup: FormGroup;
  totes = [];
  limitTotes = 2;
  wavesAvailable = 2;
  message = "Scan <b>Tote</b>";

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private modalController: ModalController) {
  }


  ngOnInit() {
    this.wavesAvailable = this.data.wavesAvailable;
    this.limitTotes = this.data.limitTotes;
    this.formGroup = this.formBuilder.group({
      tote: '',
    });
    setTimeout(() => this.setFocus('tote'), 500);
  }


  setValueInput(input, value) {
    this.formGroup.get(input).setValue(value);
  }


  validateTote(e) {
    this.setFocus('tote');

    if (e.status === 'success') {
      if (!e.data.startsWith('T-') || e.data.length > 6) {
        this.toastService.changeMessage({ color: 'danger', message: 'Invalid Tote' });
        return;
      }

      if (this.totes.some(tote => tote.name == e.data)) {
        this.toastService.changeMessage({ color: 'danger', message: 'Duplicate Tote' });
        return;
      }

      this.toastService.changeMessage({ color: 'success', message: 'Tote added successful' });
      this.message = 'Scan next <b>Tote</b>';
      this.totes.push({
        name: e.data,
        close: false
      });

      if (this.totes.length == this.limitTotes || this.totes.length == this.wavesAvailable) {
        this.goToPick();
      }
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data, duration: 2000 });
    }
  }


  goToPick() {
    this.modalController.dismiss(this.totes);
  }


  setFocus(field: string) {
    let reference;
    switch (field) {
      case 'tote': {
        reference = this.toteRef;
        break;
      }
    }

    this.setValueInput(field, '');
    setTimeout(() => {
      if (reference != null) {
        reference.setFocus();
      }
    }, 300);
  }

}
