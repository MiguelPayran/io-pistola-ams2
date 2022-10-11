import { ToastService } from '@app/_services/toast.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  templateUrl: './modal-closepick.html',
  selector: 'modal-closepick',
  styleUrls: ['./modal-closepick.scss'],
})
export class ModalClosePick implements OnInit {
  @ViewChild('location', { static: true }) locationRef;
  @ViewChild('tote', { static: true }) containerRef;

  @Input() data: any;
  @Input() closeIcon: any;
  formGroup: FormGroup;
  message ;
  labelTote;
  labelLocation;

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private modalController: ModalController) {
  }

  ngOnInit() {
    console.log(this.data);
    this.labelLocation = "SortStation("+ this.data.stagingLocation + ")";
    this.labelTote = "Tote("+ this.data.name + ")";
    this.formGroup = this.formBuilder.group({
      tote: '',
      location: '',
    });

    setTimeout(() => this.setFocus('location'), 500);
  }

  dismiss(data?) {
    this.modalController.dismiss(data);
  }

  validateLocation(e) {
    console.log(e);
    if (e.status === 'success') {
      this.setFocus('container');
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data, duration: 2000 });
    }
  }

  validateTote(e) {
    console.log(e);
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
        this.message = "Scan location <b>"+this.data.stagingLocation +'</b>';
        break;
      }
      case 'container': {
        reference = this.containerRef; 
        this.message = "Scan tote <b>"+this.data.name +'</b>';        
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