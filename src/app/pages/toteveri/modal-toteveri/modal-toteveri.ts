import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  templateUrl: './modal-toteveri.html',
  selector: 'modal-toteveri',
  styleUrls: ['./modal-toteveri.scss'],
})
export class ModalToteVeri implements OnInit {
  @ViewChild('location', { static: true }) locationRef;
  @ViewChild('wave', { static: true }) waveRef;

  @Input() data: any;
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController) {
  }


  ngOnInit() {
    console.log(this.data);
    this.formGroup = this.formBuilder.group({
      wave: new FormControl({ value: this.data.controlNumber, disabled: true }),
      location: new FormControl({ value: this.data.locationId, disabled: true })
    });
  }


  dismiss(data?) {
    this.modalController.dismiss(data);
  }
}
