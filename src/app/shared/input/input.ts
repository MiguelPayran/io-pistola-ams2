import { FormGroup } from '@angular/forms';
import { Component, ViewChild, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { FocusService } from '@app/_services/focus.service';
import { IonInput } from '@ionic/angular';

@Component({
  selector: 'pistola-input',
  templateUrl: 'input.html',
  styleUrls: ['./input.scss'],
})


export class InputComponent implements OnInit {

  @ViewChild(IonInput, { static: true }) inputRef;
  @Output() sendMessage: EventEmitter<any> = new EventEmitter();
  @Input() required = true;
  @Input() disable = false;
  @Input() myForm: FormGroup;
  @Input() label = 'Label';
  @Input() nameControl = 'input';
  @Input() type = 'text';
  @Input() textCompare = null;
  @Input() keepFocus = false;
  input;

  constructor(
    private focusService: FocusService
  ) { }


  ngOnInit() {
    this.input = this.myForm.controls[this.nameControl];
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


  check(event: any) {
    if (!this.keepFocus){
      this.setDisabledAll();
    }
    const data = event.target.value;//// PLEASE FIX!!! NO BUENO. //TODO    
    this.input.setValue(data);
    if (this.required && data.trim().length === 0) {     
      this.sendMessage.emit({ status: 'failure', data: 'Empty input. Enter data.' });
      this.input.setValue('');
      this.setFocus();
      return;
    }
    console.log(this.textCompare);
    if ( this.textCompare === null  ) {      
      this.sendMessage.emit({ status: 'success', data: data });
    } else if ( this.textCompare == data ) {
      this.sendMessage.emit({ status: 'success', data: 'success' });
    } else {
      this.sendMessage.emit({ status: 'failed', data: 'Data not match.' });        
      this.input.setValue('');
      this.setFocus();      
    }
    return;
  }
}