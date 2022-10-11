import { CommonService } from '@app/_services/common.service';
import { ToastService } from '@app/_services/toast.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  templateUrl: './modal-container.html',
  selector: 'modal-container',
  styleUrls: ['./modal-container.scss'],
})
export class ModalContainer implements OnInit {
  @ViewChild('newContainer', { static: true }) newContainerRef;

  @Input() data: any;
  @Input() closeIcon: any;
  formGroup: FormGroup;
  message;

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private commonService: CommonService,
    private modalController: ModalController) {
  }


  ngOnInit() {
    console.log(this.data);
    this.formGroup = this.formBuilder.group({
      newContainer: '',
    });
    this.setFocus('newContainer');
  }


  dismiss() {
    this.modalController.dismiss(this.formGroup.get('newContainer').value);
  }


  validateContainer(e) {
    if (e.status === 'success') {
      this.commonService.getContainerValidation(this.formGroup.get('newContainer').value).then(
        result => {
          if (result.code == 'success') {
            this.dismiss();
          } else {
            this.toastService.changeMessage({ color: 'danger', message: result.message, duration: 2000 });
            this.formGroup.get('newContainer').setValue('');
            this.setFocus('newContainer');
          }
        }
      )
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data, duration: 2000 });
      this.formGroup.get('newContainer').setValue('');
      this.setFocus('newContainer');
    }
  }


  setFocus(field: string) {
    let reference;
    switch (field) {
      case 'newContainer': {
        reference = this.newContainerRef;
        this.message = "Scan a new container";
        break;
      }
    }
    setTimeout(() => {
      if (reference != null) {
        reference.setFocus();
      }
    }, 500);
  }

}
