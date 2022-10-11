import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ToastService } from '@app/_services/toast.service';
import { AuthenticationService } from '@app/_services/authentication.service';
import { HeaderService } from '@app/_services/header.service';
import { WorkQService } from '@app/_services/workq.service';
import { FormBuilder } from '@angular/forms';
import { FormAms } from '@app/_general/form-ams';
import { WorkData } from '@app/_models/workData';

@Component({
  selector: 'app-cyclecount',
  templateUrl: './cyclecount.page.html',
  styleUrls: ['./cyclecount.page.scss'],
})
export class CycleCountPage extends FormAms implements OnInit, OnDestroy {
  @ViewChild('location', { static: true }) locationRef;
  @ViewChild('lp', { static: true }) lpRef;
  @ViewChild('item', { static: true }) itemRef;
  @ViewChild('quantity', { static: true }) quantityRef;

  labelLocation = 'Location';
  labelItem = 'Item';
  labelQuantity = 'Quantity';
  dataContainer = '';
  isRecount = false;
  qtyRecount = 0;
  isAdjust = false;
  details = [];
  workData: WorkData;
  workType = '08';
  shrtBtn = false;
  itemNumber = '';
  findingWork = false;
  isAutomatic = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastService: ToastService,
    private workQService: WorkQService,
    private headerService: HeaderService,
    private alertController: AlertController,
    private authenticationService: AuthenticationService
  ) {
    super();
    this.workData = new WorkData();
  }


  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      location: '',
      lp: '',
      item: [{ value: '', disabled: true }],
      quantity: [{ value: '', disabled: true }],
    });

    this.subscription = this.headerService.currentMessage.subscribe(header => {
      if (header === 'clear') {
        console.log('picking');
        this.resetForm();
      }
    });
    this.resetForm();
  }


  resetForm() {
    console.log('resetForm');
    this.formGroup.reset();
    this.labelLocation = 'Location';
    this.labelItem = 'Item';
    this.labelQuantity = 'Quantity';
    this.dataContainer = '';
    this.isRecount = false;
    this.itemNumber = '';
    this.headerService.changeTitle('Cycle Count');
    this.workData = new WorkData();
    this.shrtBtn = false;    
    this.message = '';
    this.disableAllFields();
    this.user = this.authenticationService.currentUserValue.userDetails;
    if(this.isAutomatic){
      this.findWork();
    }else{      
      this.setFocus('location');
    }
    
  }


  findWork() {
    console.log('findWork');
    if(!this.findingWork){
      this.findingWork = true;
    this.workQService.getWorkPistola({
      workType: this.workType,
      locationId: this.isAutomatic?null:this.getValueInput('location')
    }).then(
      (result) => {
        this.findingWork = false;
        if (result.code === 'work_assigned' && result.data.workType !== this.workType) {
          this.presentAlertWork(result.data);
          return;
        }

        this.workData = result.data;
        console.log(this.workData);
        if (this.workData.workQId !== null) {
          if(this.isAutomatic){
            this.message = 'Enter location <b>' + this.workData.sourceLocation + '</b>';
            this.setFocus('location');
          } else {            
            this.setFocus('item');
            this.message = 'Scan item <b>' + this.workData.displayItemNumber + '</b>';
          }
        } else {
          this.message = '';          
          this.toastService.changeMessage({ color: 'danger', message: 'No more work ', duration: 2000 });
          if(!this.isAutomatic){
            this.setValueInput('location','');
          }
        }
      },
      (error) => {
          console.log('error');
          this.findingWork = false;
      }
    );
  }
  }



  validateLocation(e): void {
    console.log('validateLocaiton');
    if (e.status === 'success') {
      if (e.data.itemHuIndicator == 'H') {
        this.setFocus('lp');
        this.message = 'Scan LP <b>' + this.workData.sourceLP + '</b>';
      } else if (e.data.itemHuIndicator == 'I' || e.data.itemHuIndicator == 'M') {
        if(this.isAutomatic){
          this.setFocus('item');
          this.message = 'Scan item <b>' + this.workData.displayItemNumber + '</b>';
        }else{
          this.findWork();
        }
      }
    } else {
      this.toastService.changeMessage({ color: 'danger', message: 'Enter location: ' + this.workData.sourceLocation });
    }
  }


  validateLP(e) {
    if (e.status === 'success') {
      this.setFocus('item');
      this.message = 'Scan <b>item</b>';
      this.labelLocation = this.workData.sourceLocation;
      this.dataContainer = e.data;
    }
    else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });

    }
  }


  validateItem(e): void {
    console.log(e);
    let isRepeat = false;
    if (e.status === 'success') {
      if (this.getValueInput('item') == this.workData.displayItemNumber) {
        this.itemNumber = e.data.itemNumber;
        this.setFocus('quantity');
        this.labelQuantity = 'Quantity';
        this.message = 'Enter <b>quantity</b>';
      } else {
        this.toastService.changeMessage({ color: 'danger', message: 'Invalid Item' });
      }
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  validateQuantity(e) {
    const qty = this.getValueInput('quantity') === null ? '' : this.getValueInput('quantity');

    if (qty !== '') {
      if (e.status === 'success') {
        if (this.isRecount) {
          if (this.qtyRecount == qty) {
            this.isRecount = false;
            console.log('count ok');
            this.submitCC();
          } else {
            this.qtyRecount = qty;
            this.toastService.changeMessage({ color: 'danger', message: 'Recount doesnt match, count again', duration: 5000 });
            console.log('Recount Again');
            this.setValueInput('quantity', '');
            this.setFocus('quantity');
          }
        } else {
          this.qtyRecount = qty;
          this.setValueInput('quantity', '');
          this.setFocus('quantity');

          this.message = 'Recount item <b>' + this.getValueInput('item') + '</b>';
          this.isRecount = true;
        }

      }
      else {
        this.toastService.changeMessage({ color: 'danger', message: e.data });
        this.setValueInput('quantity', '');
        this.setFocus('quantity');
      }
    }
    else if (e.data = 'Empty input. Enter a valid quantity.') {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  submitCC() {
    this.workData.sourceLocation = this.getValueInput('location');
    this.workData.sourceLP = this.getValueInput('lp');
    this.workData.plannedQuantity = this.getValueInput('quantity');
    this.workQService.workComplete(this.workData).subscribe(
      (result) => {
        if (result.code === 'success') {
          this.toastService.changeMessage({ color: 'success', message: 'CC success' });
          this.resetForm();
        }
        else {
          this.toastService.changeMessage({ color: 'danger', message: result.message });
        }
      });
  }

  

  onToggleAutomatic(checked){
    this.isAutomatic = checked;    
    if(this.isAutomatic){
      this.findWork();
    }else{
      this.resetForm();
    }
  }


  async presentAlertWork(data) {
    const alert = await this.alertController.create({
      header: 'You have a work assignment for other process.',
      buttons: [{
        text: 'Continue',
        handler: (blah) => {
          if (data.workType == "26") {
            if (data.version == "v2") {
              this.router.navigateByUrl('/mobile/picking/pick', { replaceUrl: true });
            } else {
              this.router.navigateByUrl('/mobile/picking/cart', { replaceUrl: true });
            }
          }
        }
      }]
    });
    await alert.present();
  }


  setFocus(field: string) {
    let reference;
    switch (field) {
      case 'location': {
        reference = this.locationRef;
        break;
      }
      case 'lp': {
        reference = this.lpRef;
        break;
      }
      case 'item': {
        reference = this.itemRef;
        break;
      }
      case 'quantity': {
        reference = this.quantityRef;
        break;
      }
    }
    setTimeout(() => {
      if (reference != null) {
        reference.setFocus();
      }
    }, 300);
  }


}