import { FormGroup } from '@angular/forms';
import { Component, ViewChild, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { FocusService } from '@app/_services/focus.service';
import { IonInput } from '@ionic/angular';
import { ZoneService } from '@app/_services/zone.service';

@Component({
  selector: 'pistola-zone',
  templateUrl: 'zone.html',
  styleUrls: ['./zone.scss'],
})


export class ZoneComponent implements OnInit {
  @ViewChild(IonInput, { static: true }) inputRef;
  @Output() sendMessage: EventEmitter<any> = new EventEmitter();
  @Input() required = true;
  @Input() disable = false;
  @Input() myForm: FormGroup;
  @Input() label = 'Zone';
  @Input() nameControl = 'zone';
  @Input() zoneType = null;
  

  zone;

  constructor(
    private zoneService: ZoneService,
    private focusService: FocusService
  ) { }


  ngOnInit() {
    this.zone = this.myForm.controls[this.nameControl];
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


  setDisable(band) {
    this.disable = band;
  }


  checkZone(event: any) {
    console.log('shared component zone');
    this.setDisabledAll();
    const item = event.target.value;
    if (this.required && item.trim().length === 0) {
      this.sendMessage.emit({ status: 'failure', data: 'Empty input. Enter a valid zone.' });
      this.zone.setValue('');
      this.setFocus();
      return;
    }
    if (!this.required && item.trim().length === 0) {
      this.sendMessage.emit({ status: 'success', data: 'Empty input.' });
      return;
    }
    // call service
    this.zoneService.getZones(item).then(
      result => {        
        if (!result) {
          this.sendMessage.emit({ status: 'failure', data: 'Invalid Zone' });
          this.zone.setValue('');
          this.setFocus();
          return;
        } else {
          if ((this.zoneType != null) && result.data.zoneType != this.zoneType) {
            this.sendMessage.emit({ status: 'failure', data: 'Zone does not match type' });
            this.zone.setValue('');
            this.setFocus();
          } else{
            this.sendMessage.emit({ status: 'success', data: result });
          }
        }
      },
      (error) => {
        this.sendMessage.emit({ status: 'failure', data: 'API failure' });        
        this.setFocus();
      });
  }
}
