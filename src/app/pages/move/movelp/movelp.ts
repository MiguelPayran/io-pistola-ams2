import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LPService } from '@app/_services/lp.service';
import { ToastService } from '@app/_services/toast.service';
import { FocusService } from '@app/_services/focus.service';
import { Adjust } from '@app/_models/adjust';



@Component({
  selector: 'movelp',
  templateUrl: './movelp.html',
  styleUrls: ['./movelp.scss'],
})
export class MoveLpComponent implements OnInit {
  @ViewChild('loc1', { static: false }) locationRef;
  @ViewChild('lp1', { static: false }) lpRef;
  @ViewChild('loc2', { static: false }) destLocationRef;
  @ViewChild('lp2', { static: false }) destlpRef;

  myForm: FormGroup;
  fromLocationId;
  productRef;
  btnMoveAllVisible = false;
  tolocationId;
  toLPId;
  btnMoveVisible = false;

  constructor(
    public toastService: ToastService,
    public lpService: LPService,
    public formBuilder: FormBuilder,
    public focusService: FocusService
  ) { }


  ngOnInit() {
    this.myForm = this.formBuilder.group({
      fromLocation: [{ value: '', disabled: true }],
      fromLP: [{ value: '', disabled: true }],
      toLocation: [{ value: '', disabled: true }],
      toLP: [{ value: '', disabled: true }],
      qty: [{ value: '', disabled: true }],
      item: [{ value: '', disabled: true }],
    });

  }


  getValueInput(input) {
    return this.myForm.controls[input].value;
  }


  setValueInput(input, value) {
    this.myForm.get(input).setValue(value);
  }


  disableForm() {
    for (const field in this.myForm.controls) {
      this.myForm.get(field).disable();
    }
  }


  async presentToast(message, color) {
    const toast = await this.toastService.changeMessage({
      header: message,
      color: color,
      duration: 3000
    });
  }


  resetForm() {
    this.myForm.reset();
    this.locationRef.setFocus();
  }


  ionViewWillEnter() {
    this.locationRef.setFocus();
  }


  validateLocation(e) {
    this.fromLocationId = e.data.locationId
    if (e.status === 'success') {
      console.log(this.locationRef.location.value);
      this.lpRef.setFocus();
      this.toastService.changeMessage({ message: 'Scan license plate', color: 'success' });
    } else {
      this.toastService.changeMessage({ message: e.data, color: 'danger' });
    }

    if (e.data.itemHuIndicator === 'I' || e.data.itemHuIndicator === 'M') {
      this.destLocationRef.setFocus();
      this.toastService.changeMessage({ message: 'Scan destination location', color: 'success' });
      this.btnMoveAllVisible = true;
    }
  }


  validateLP(e) {
    if (e.status === 'success') {
      this.destLocationRef.setFocus();
      this.toastService.changeMessage({ message: 'Scan destination location', color: 'success' });
    } else {
      this.toastService.changeMessage({ message: e.data, color: 'danger' });
      console.log(e.data);
    }
  }


  validateDestLocation(e) {
    if (e.status == 'success') {
      this.tolocationId = e.data.locationId;
      if (e.data.itemHuIndicator === 'I' || e.data.itemHuIndicator === 'M') {
        this.lpMove();
      }
      if (e.data.itemHuIndicator === 'H') {
        this.toastService.changeMessage({ message: 'Scan Destination LP', color: 'success' });
        this.destlpRef.setFocus();
      }
    } else {
      this.toastService.changeMessage({ message: e.data, color: 'danger' });
    }
  }


  validateDestLP(e) {
    if (e.data == 'Invalid LP' || (e.status == 'success')) {
      this.toLPId = this.destlpRef.lp.value;
      console.log(this.destlpRef.lp.value);
      this.btnMoveVisible = true;
      this.disableForm();
      this.lpMove();
    } else {
      this.toastService.changeMessage({ message: e.data, color: 'danger' });
      this.destlpRef.lp.setValue('');
      this.destlpRef.setFocus();
    }
  }


  lpMove() {
    const move: Adjust = new Adjust();
    move.whId = '01';
    move.sourceLocation = this.getValueInput('fromLocation')
    move.sourceLP = this.getValueInput('fromLP')
    move.destinationLP = this.getValueInput('toLP')
    move.destinationLocation = this.getValueInput('toLocation')
    move.transactionCode = '201';
    move.transactionDescription = 'Move LP';
    move.sourceLPType = 'IV';
    move.destinationLPType = 'IV'
    console.log(move);
    this.lpService.moveLP(move).then(result => {
      if (result.length != 0) {
        this.toastService.changeMessage({ message: 'License plate has been moved', color: 'success' });
      }
      this.resetForm();
    });
  }

}


