import { ToastService } from '@app/_services/toast.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  templateUrl: './modal-cart.html',
  selector: 'modal-cart',
  styleUrls: ['./modal-cart.scss'],
})
export class ModalCart implements OnInit {
  @ViewChild('location', { static: true }) locationRef;

  @Input() data: any;
  formGroup: FormGroup;
  message ;

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private modalController: ModalController) {
  }

  ngOnInit() {
    console.log(this.data);
    this.formGroup = this.formBuilder.group({
      location: '',
    });

    this.setFocus('location');
  }


  dismiss(data?) {
    this.modalController.dismiss(data);
  }


  validateCart(e) {
    if (e.status === 'success') {
      this.dismiss(this.data);
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data, duration: 2000 });
    }
  }
  

  setFocus(field: string) {
    let reference;
    switch (field) {
      case 'location': {
        reference = this.locationRef;
        this.message = "Scan cart <b>"+this.data.destinationCart +'</b>';
        break;
      }
    }
    setTimeout(() => {
      if(reference != null){
          reference.setFocus();
      }
  }, 500);   
  }

}
