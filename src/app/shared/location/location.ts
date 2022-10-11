import { TranslateService } from '@ngx-translate/core';
import { FormGroup } from '@angular/forms';
import { Component, ViewChild, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { LocationService } from '@app/_services/location.service';
import { FocusService } from '@app/_services/focus.service';

@Component({
  selector: 'pistola-location',
  templateUrl: 'location.html',
  styleUrls: ['./location.scss']
})

export class LocationComponent implements OnInit {

  @ViewChild(IonInput, { static: true }) inputRef;
  @Output() sendMessage: EventEmitter<any> = new EventEmitter();
  @Input() required = false;
  @Input() disable = false;
  @Input() pickArea: string = null;
  @Input() myForm: FormGroup;
  @Input() label = 'Location';
  @Input() nameControl = 'location';
  @Input() type: string = null;
  location;
  emptyDataTxt;


  constructor(
    public locationService: LocationService,
    public focusService: FocusService,
    public translateService: TranslateService
  ) {
  }


  ngOnInit() {
    this.location = this.myForm.controls[this.nameControl];//this.label = this.translateService.instant('LOCATION')    
  }


  setFocus() {
    this.focusService.changeMessage({
      form: this.myForm, eleFocus: this.inputRef
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


  checkLocation(event: any) {
    this.setDisabledAll();
    const location = event.target.value;
    if (location.trim().length === 0 && this.required) {
      this.sendMessage.emit({ status: 'failure', data: this.translateService.instant('EMPTY_DATA') });
      this.setFocus();
      return;
    }
    if (location.trim().length === 0 && !this.required) {
      this.sendMessage.emit({ status: 'success', data: this.translateService.instant('EMPTY_DATA') });
      return;
    }
    this.locationService.getLocations(location, this.pickArea, this.type).then(
      (result) => {
        if (result) {
          this.sendMessage.emit({ status: 'success', data: result });
        } else {
          this.sendMessage.emit({ status: 'failure', data: this.translateService.instant('INV_LOCATION') });
          this.location.setValue('');
          this.setFocus();
        }
      },
      (error) => {
        this.sendMessage.emit({ status: 'failure', data: this.translateService.instant('API_FAILURE') });
        this.setFocus();
      }
    );
  }
}
