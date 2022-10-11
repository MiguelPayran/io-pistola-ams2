import { Injectable } from '@angular/core';
import { IonSelect } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FocusService {

  private messageSource = new BehaviorSubject(null);
  currentMessage = this.messageSource.asObservable();


  constructor() {
    console.log('focus');
    this.currentMessage.subscribe(message => {
      if (message !== null && message.form) {
        for (const field in message.form.controls) {
          message.form.get(field).disable();
        }
        if(message.eleFocus){
          message.eleFocus.disabled = false;       
          if ((message.eleFocus instanceof  IonSelect  ==false)){
            setTimeout(() => message.eleFocus.setFocus(), 50);
          }
        }
      }
    }
    );
  }
  

  changeMessage(message) {
    this.messageSource.next(message);
  }
}