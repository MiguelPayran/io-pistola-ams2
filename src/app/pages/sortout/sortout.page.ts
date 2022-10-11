import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ModalController } from '@ionic/angular';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { FormAms } from '@app/_general/form-ams';
import { AuthenticationService } from '@app/_services/authentication.service';
import { LPService } from '@app/_services/lp.service';
import { HeaderService } from '@app/_services/header.service';
import { WorkData } from '@app/_models/workData';
import { WorkQService } from '@app/_services/workq.service';
import { ToastService } from '@app/_services/toast.service';
import { ModalCart } from './modal-cart/modal-cart';

@Component({
  selector: 'app-sortout',
  templateUrl: './sortout.page.html',
  styleUrls: ['./sortout.page.scss'],
})
export class SortoutPage extends FormAms implements OnInit, OnDestroy {
  @ViewChild('sourceLocation', { static: true }) sourceLocationRef;
  @ViewChild('tote', { static: true }) toteRef;
  @ViewChild('destLocation', { static: true }) destLocationRef;
  @ViewChild('item', { static: true }) itemRef;

  workData = new WorkData();
  workType = '23';
  labelDestLocation = 'Putwall Location';
  labelTote = 'Tote';
  previousCart = '';
  itemNumber = '';
  clientId = 0;

  constructor(
    private workQService: WorkQService,
    private lpService: LPService,
    private translateService: TranslateService,
    private authenticationService: AuthenticationService,
    private toastService: ToastService,
    private modalController: ModalController,
    private headerService: HeaderService,
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController) {
      super();
  }


  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      sourceLocation: [''],
      tote: [''],
      item: [''],
      destLocation: [{ value: '', disabled: true }],
    });

    this.subscription = this.headerService.currentMessage.subscribe(header => {
      if (header === 'clear') {
        console.log('sortout');
        this.resetForm();
      }
    });
  }
  

  resetForm() {
    this.formGroup.reset();
    this.sourceLocationRef.setFocus();
    this.workData = new WorkData();
    this.labelDestLocation = 'Putwall Location';//this.translateService.instant('DEST_LOC');
    this.labelTote = 'Tote';
    this.message = 'Scan <b>location</b>';    
    this.headerService.changeTitle('Sortout');    
    this.previousCart = '';
    this.itemNumber = '';
    //this.setValueInput('sourceLocation','SORTSTAGE-03');
  }


  ionViewWillEnter() {    
    this.workQService.workUnassignwork(null);
    this.sourceLocationRef.setFocus();
    this.labelDestLocation = 'Putwall Location';//this.translateService.instant('DEST_LOC');
    this.user = this.authenticationService.currentUserValue.userDetails;
    this.message = 'Scan <b>location</b>'
  }


  async presentModalCart(data) { // Modal will show the details that you have in the tote    
    const modal = await this.modalController.create({
      component: ModalCart,
      backdropDismiss:false,
      componentProps: {
        data
      }
    });

    modal.onDidDismiss().then(
      response => {
        if(response.data){
          this.previousCart = this.workData.destinationCart;
          this.destLocationRef.setFocus();
            this.message = 'Scan location<b>' + ' ' + this.workData.destinationLocation + '</b>';
        }
       console.log(response);
      });

    return await modal.present();
  }


  async presentAlertWork(data) {
    const alert = await this.alertController.create({
      header: this.translateService.instant('WORK_ASSIG_PICK'),
      buttons: [{
        text: this.translateService.instant('CONTINUE'),
        handler: (blah) => {       
          if(data.workType == "26"){
            if (data.version == "v2"){
              this.router.navigateByUrl('/mobile/picking/cart', { replaceUrl: true });
            }else{
              this.router.navigateByUrl('/mobile/picking/pick', { replaceUrl: true });
            }
          }        
        }
      }]
    });
    await alert.present();
  }


  validateLocation(e) {
    console.log(this.workData.orderNumber);
    if (e.status === 'success') {     
      const loc = e.data.locationId;
      this.lpService.getItemsByLocationOrLP(loc, null).then((result) => {
        if (result.data.length === 0) {
          this.toastService.changeMessage({ color: 'danger', message: 'Location is empty', duration: 5000 });
          this.setValueInput('sourceLocation','');
          this.setFocus('sourceLocation');
        }
        else {
          if (e.data.itemHuIndicator === 'H') {
            this.setFocus('tote');
            this.labelTote = 'Tote';
            this.message = 'Scan <b>tote</b>';
          }
          else {
            this.toastService.changeMessage({ color: 'danger', message: this.translateService.instant('INV_LOCATION') });
            this.setValueInput('sourceLocation', '');
            this.setFocus('sourceLocation');
          }
        }
      });
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  validateTote(e) {   
    if (e.status === 'success') {
      this.clientId = e.clientId;
      this.setFocus('item');
      this.message = 'Scan <b>Item</b>';
      this.updateContainerQty();
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  updateContainerQty(){
    this.lpService.getItemsByLocationOrLP(this.getValueInput('sourceLocation'), this.getValueInput('tote')).then(
      result => {
        var qty = 0;
        result.data.forEach(element => {
          qty = qty + element.actualQty;
        });
        this.labelTote = 'Tote ('+ qty+' items)';
      }
    );
  }


  validateItem(e) {
    console.log(this.workData.orderNumber);
    if (e.status === 'success') {
      this.itemNumber = e.data.itemNumber;
      this.findWork();
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  findWork() {
    this.workQService.getWorkPistola(
      {
        workType: '23',
        displayItemNumber: this.formGroup.controls['item'].value,
        itemNumber: this.itemNumber,
        lp: this.formGroup.controls['tote'].value
      }
    ).then(
      (result) => {
         
        if (result.code === 'work_assigned' && result.data.workType !== this.workType) {
          this.presentAlertWork(result.data);
          return;
        }
        if (result.code === 'no_locations_available') {
          this.toastService.changeMessage({ color: 'danger', message: result.message });
          this.setValueInput('item', '');
          this.setFocus('item');
        } else {
          if (result.message !== 'error') {
            this.workData = result.data;
            if(this.workData.destinationCart != null && this.previousCart != this.workData.destinationCart){//cart logic
              this.presentModalCart(result.data);
            }else{
              this.destLocationRef.setFocus();
              this.message = 'Scan location<b>' + ' ' + this.workData.destinationLocation + '</b>';
            }  
          } else {
            this.setValueInput('item', '');            
            this.setFocus('item');
            if (result.code === 'item_not_on_lp') {
              this.toastService.changeMessage({ color: 'danger', message: 'Item not in LP' });
              return;
            }
            this.toastService.changeMessage({ color: 'danger', message: result.code });
          }
        }

      },
      (error) => console.log(error)
    );
  }


  validateDestLocation(e) {
    console.log(this.workData.orderNumber);
    if (e.status === 'success') {
      this.workData.pickedQuantity = 1;
      this.completePicking();
    } else {
      this.toastService.changeMessage({ color: 'danger', message: this.translateService.instant('ENTER_LOCATION') + ' ' + this.workData.destinationLocation });
    }
  }


  completePicking() {
    console.log('workComplete');
    this.workQService.workComplete(this.workData).subscribe(
      (result) => {
        this.setValueInput('item', '');
        this.setValueInput('destLocation', '');
        this.labelDestLocation =  'Putwall Location';//this.translateService.instant('DEST_LOC');
        if (result.code !== 'no_more_work') {
          if(result.code == 'no_more_items_in_container'){
            this.labelTote = 'Tote';
            this.message='Scan <b>tote</b>';
            this.toastService.changeMessage({ color: 'success', message: "No more items in tote <b>"+this.getValueInput('tote')+'</b>', duration: 5000 });
            this.setValueInput('tote', '');
            this.setFocus('tote');
          } else if(result.code == 'location_empty' || result.code == 'mix_location'){
            this.setValueInput('sourceLocation', '');
            this.setFocus('sourceLocation');
            this.setValueInput('tote', '');
            this.sourceLocationRef.setFocus();
            this.resetForm();
            this.toastService.changeMessage({ color: 'danger', message: result.code == 'location_empty' ?"Location is empty":"mix location, scan again the item", duration: 5000 });
            this.message = 'Scan <b>location</b>';
          } else {
            this.toastService.changeMessage({ color: 'success', message: "Item saved", duration: 5000 });
            this.message = 'Scan new <b>item</b>'
            this.setFocus('item');
            this.updateContainerQty();
          }
        } else {
          this.setValueInput('tote', '');
          this.setFocus('tote');
          this.message='Scan <b>tote</b>';
        }
      },
      (error) => console.log('error - completeWork')
    );
  }


  setFocus(field: string) {
    let reference;
    switch (field) {
      case 'sourceLocation': {
        reference = this.sourceLocationRef;
        break;
      }
      case 'tote': {
        reference = this.toteRef;
        break;
      }
      case 'item': {
        reference = this.itemRef;
        break;
      }
      case 'destLocation': {
        reference = this.itemRef;
      }
    }
    setTimeout(() => {
      if(reference != null){
          reference.setFocus();
      }
    }, 300);  
  }

}
