import { IonInput } from '@ionic/angular';
import { FormGroup } from '@angular/forms';
import { Component, ViewChild, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { LPService } from '@app/_services/lp.service';
import { FocusService } from '@app/_services/focus.service';


@Component({
  selector: 'pistola-lp',
  templateUrl: 'lp.html',
  styleUrls: ['./lp.scss'],
})


export class LPComponent implements OnInit {
  @ViewChild(IonInput, { static: true }) inputRef;
  @Output() sendMessage: EventEmitter<any> = new EventEmitter();
  @Input() required = true;
  @Input() disable = false;
  @Input() checkLocation = '';
  @Input() myForm: FormGroup;
  @Input() label = 'LP';
  @Input() nameControl = 'lp';
  @Input() newLP = false;
  @Input() emptyLP:boolean = false;
  lp;


  constructor(
    public lpService: LPService,
    public focusService: FocusService
  ) { }


  ngOnInit() {
    this.lp = this.myForm.controls[this.nameControl];
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


  checkLP(event: any) {
    this.setDisabledAll();
    if (this.newLP == true && this.checkLocation == null){
      this.sendMessage.emit({ status: 'success', data: 'Check Location required' });
    }
    const lp = event.target.value;
    if (this.required && lp.trim().length === 0) {
      this.sendMessage.emit({ status: 'failure', data: 'Empty Input. Enter LP.' });
      this.setFocus();
      return;
    }
    if (!this.required && lp.trim().length === 0) {
      this.sendMessage.emit({ status: 'success', data: 'Empty Input.' });
      return;
    }
    // call service
    this.lpService.getLP(lp).then
      (result => {
        if (result.length === 0) {
          if(this.newLP === true || this.emptyLP === true){
            this.sendMessage.emit({ status: 'success', data: lp });
          }
          else{
            this.lp.setValue('');
            this.sendMessage.emit({ status: 'failure', data: 'Invalid LP' });
            this.setFocus();
            return;
          }
        } else {
          if (result[0].locationId !== this.checkLocation && this.checkLocation != null && this.checkLocation !== '') {
            this.lp.setValue('');
            this.sendMessage.emit({ status: 'failure', data: 'LP does not exist in this location ' + this.checkLocation });
            this.setFocus();
          } else {
            if(this.emptyLP){              
              this.lp.setValue('');
              this.sendMessage.emit({ status: 'failure', data: 'Container exist in another location' });
              this.setFocus();
            }
            else{
              this.sendMessage.emit({ status: 'success', data: lp , clientId: result[0].clientId  });
            }
          }
        }
      },
        (error) => {
          this.sendMessage.emit({ status: 'failure', data: 'API Failure' });
          this.setFocus();
        });
  }
}
