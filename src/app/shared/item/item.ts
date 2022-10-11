import { FormGroup } from '@angular/forms';
import { Component, ViewChild, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { InventoryService } from '@app/_services/inventory.service';
import { FocusService } from '@app/_services/focus.service';
import { IonInput } from '@ionic/angular';

@Component({
  selector: 'pistola-item',
  templateUrl: 'item.html',
  styleUrls: ['./item.scss'],
})


export class ItemComponent implements OnInit {

  @ViewChild(IonInput, { static: true }) inputRef;
  @Output() sendMessage: EventEmitter<any> = new EventEmitter();
  @Input() required = true;
  @Input() disable = false;
  @Input() detail = true;
  @Input() myForm: FormGroup;
  @Input() label = 'Item';
  @Input() checkLocation = '';
  @Input() nameControl = 'item';
  @Input() keepFocus = false;
  @Input() clientId = null;
  item;

  constructor(
    private inventoryService: InventoryService,
    private focusService: FocusService
  ) { }


  ngOnInit() {
    this.item = this.myForm.controls[this.nameControl];
  }


  setFocus() {
    this.focusService.changeMessage({
      form: this.myForm,
      eleFocus: this.inputRef
    });
  }


  setDisable(band) {
    this.disable = band;
  }


  setDisabledAll() {
    this.focusService.changeMessage({
      form: this.myForm
    });
  }


  checkItem(event: any) {
    
    this.setDisabledAll();
    /*if (!this.keepFocus){
      this.setDisabledAll();
    }*/
    const item = event.target.value;
    // this.inputRef.value = '';
    if (this.required && item.trim().length === 0) {
      this.sendMessage.emit({ status: 'failure', data: 'Empty input. Enter a valid item.' });
      this.item.setValue('');
      this.setFocus();
      return;
    }
    if (!this.required && item.trim().length === 0) {
      this.sendMessage.emit({ status: 'success', data: 'Empty input.' });
      return;
    }
    // call service
    this.inventoryService.getItem(this.clientId ,item, this.detail).then(
      result => {
        if (!result) {
          this.sendMessage.emit({ status: 'failure', data: 'Invalid item number' });
          this.item.setValue('');
          this.setFocus();
          return;
        } else {
          console.log(result);
          this.sendMessage.emit({ status: 'success', data: result });
        }
      },
      (error) => {
        this.sendMessage.emit({ status: 'failure', data: 'API failure' });
        this.setFocus();
      });
  }
}
