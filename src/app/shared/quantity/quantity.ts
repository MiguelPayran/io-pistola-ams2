import { FormGroup } from '@angular/forms';
import { Component, ViewChild, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { FocusService } from '@app/_services/focus.service';
import { IonInput } from '@ionic/angular';
@Component({
  selector: 'pistola-qty',
  templateUrl: 'quantity.html',
  styleUrls: ['./quantity.scss'],
})


export class QuantityComponent implements OnInit {
  
  @ViewChild(IonInput, { static: true }) inputRef;
  @Output() sendMessage: EventEmitter<any> = new EventEmitter();
  @Input() required = true;
  @Input() minValue = 1;
  @Input() maxValue = 1000;
  @Input() itemNumber = null;
  @Input() location;
  @Input() label = 'Quantity';
  @Input() myForm: FormGroup;
  @Input() nameControl = 'quantity';
  @Input() zeroqty = false; //If you want to permit 0
  quantity;


  constructor(
    public focusService: FocusService
  ) { }


  ngOnInit() {
    this.quantity = this.myForm.controls[this.nameControl];
  }


  setFocus() {
    this.focusService.changeMessage({
      form: this.myForm,
      eleFocus: this.inputRef
    });
  }


  setDisabledAll() {
    this.focusService.changeMessage({
      form: this.myForm
    });
  }


  checkQuantity(event: any) {
    this.setDisabledAll();
    console.log('checkQuantity');
    console.log(this.zeroqty);
    const qty = event.target.value;
    this.quantity.setValue(qty);
    if (this.itemNumber && this.location) {
      console.log('with item');
    } else {
      console.log('without item validation');
    }
    if (this.required && qty.trim().length === 0 ) {
      this.sendMessage.emit({ status: 'failure', data: 'Empty input. Enter a valid quantity.' });
      this.setFocus();
      return;
    }
    var quty = parseInt(qty);
    if (quty < this.minValue) {
      this.sendMessage.emit({ status: 'failure', data: 'Less then available quantity' });
      this.quantity.setValue('');
      this.setFocus();
      return;
    }
    if(this.zeroqty && quty === 0 ){
      this.sendMessage.emit({ status: 'success', data: qty });
      return;
    }
    if (quty < this.minValue || quty > this.maxValue ) {
      this.sendMessage.emit({ status: 'failure', data: 'Invalid Value' });
      this.quantity.setValue('');
      this.setFocus();
      return;
    }
    this.sendMessage.emit({ status: 'success', data: qty });
  }
}