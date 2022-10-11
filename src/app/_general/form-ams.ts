import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';


export class FormAms {
  subscription: Subscription;
  formGroup: FormGroup;
  message;
  user;


  ngOnDestroy(): void {
    this.subscription != null ? this.subscription.unsubscribe() : '';
  }


  getValueInput(input) {
    return this.formGroup.controls[input].value;
  }


  setValueInput(input, value) {
    this.formGroup.get(input).setValue(value);
  }
  

  disableAllFields() { //disable all the fields
    for (const field in this.formGroup.controls) {
      this.formGroup.get(field).disable();
    }
  }
}