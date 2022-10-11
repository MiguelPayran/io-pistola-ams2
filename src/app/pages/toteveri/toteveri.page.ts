import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { FormAms } from '@app/_general/form-ams';
import { HeaderService } from '@app/_services/header.service';
import { AuthenticationService } from '@app/_services/authentication.service';
import { LPService } from '@app/_services/lp.service';
import { ModalController } from '@ionic/angular';
import { ToastService } from '@app/_services/toast.service';
import { ModalToteVeri } from './modal-toteveri/modal-toteveri';

@Component({
  selector: 'app-toteveri',
  templateUrl: './toteveri.page.html',
  styleUrls: ['./toteveri.page.scss'],
})
export class ToteVeriPage extends FormAms implements OnInit, OnDestroy {
  @ViewChild('tote', { static: true }) toteRef;


  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private lpService: LPService,
    private headerService: HeaderService,
    private modalController: ModalController,
    private authenticationService: AuthenticationService
  ) {
    super();
  }


  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      tote: new FormControl({value: '', disabled: true})
    });

    this.subscription = this.headerService.currentMessage.subscribe(header => {
      if (header === 'clear') {
        console.log('toteveri');
        this.resetForm();
      }
    });
  }


  ionViewWillEnter() {
    this.user = this.authenticationService.currentUserValue.userDetails;
    this.resetForm();
  }


  resetForm() {
    console.log('resetForm');
    this.formGroup.reset();
    this.message = 'Enter <b>tote</b>';
    this.headerService.changeTitle('Tote Verification');
    this.disableAllFields();
    this.setFocus('tote');
  }


  async presentModalToteDetail(data) {
    const modal = await this.modalController.create({
      component: ModalToteVeri,
      backdropDismiss: true,
      componentProps: {
        data
      }
    });


    modal.onDidDismiss().then(
      response => {        
        this.setFocus('tote');
      });

    return await modal.present();
  }


  validateTote(e) {
    console.log(e.data);
    if (e.status === 'success') {
      this.lpService.getLP(e.data).then(
        result => { 
          console.log(result);
          this.setValueInput('tote','');          
          this.setFocus('tote');
          this.presentModalToteDetail(result[0]);
        }
      );
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  setFocus(field: string) {
    let reference;
    switch (field) {
      case 'tote': {
        reference = this.toteRef;
        break;
      }
    }
    setTimeout(() => {
      if(reference != null){
          reference.setFocus();
      }
    }, 300);
  }
}
