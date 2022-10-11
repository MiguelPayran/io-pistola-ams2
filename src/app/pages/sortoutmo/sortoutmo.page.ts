import { WaveService } from '@app/_services/wave.service';
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
import { ModalContainer } from './modal-cart/modal-container';

@Component({
  selector: 'app-sortoutmo',
  templateUrl: './sortoutmo.page.html',
  styleUrls: ['./sortoutmo.page.scss'],
})
export class SortoutMOPage extends FormAms implements OnInit, OnDestroy {
  @ViewChild('wave', { static: true }) waveRef;
  @ViewChild('sourceLocation', { static: true }) sourceLocationRef;
  @ViewChild('sourceLP', { static: true }) sourceLPRef;
  @ViewChild('item', { static: true }) itemRef;
  @ViewChild('quantity', { static: true }) quantityRef;
  @ViewChild('container', { static: true }) containerRef;

  workData = new WorkData();
  workType = '13';
  labelLP = 'Tote';
  labelQuantity = 'Quantity';
  previousCart = '';
  itemNumber = '';
  fullContainer = false;
  scanLP = false;
  

  constructor(
    private workQService: WorkQService,
    private waveService: WaveService,
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
      wave: [''],
      sourceLocation: [''],
      sourceLP: [''],
      item: [''],
      quantity: [{ value: '', disabled: true }],
      container: [{ value: '', disabled: true }],
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
    this.fullContainer = false;
    this.scanLP = false;
    this.setFocus('wave');
    this.workData = new WorkData();
    this.labelLP = 'Tote';
    this.labelQuantity = 'Quantity';
    this.message = 'Scan <b>location</b>';    
    this.headerService.changeTitle('Sortout');    
    this.previousCart = '';
    this.itemNumber = '';
  }


  ionViewWillEnter() {    
    this.workQService.workUnassignwork(null);
    this.setFocus('wave');
    this.user = this.authenticationService.currentUserValue.userDetails;
    this.message = 'Scan <b>location</b>'
  }


  async presentModalContainer(data, dismiss) { // Modal will show the details that you have in the LP    
    const modal = await this.modalController.create({
      component: ModalContainer,
      backdropDismiss:dismiss,
      componentProps: {
        data,
        closeIcon: dismiss
      }
    });

    modal.onDidDismiss().then(
      response => {
        if(response.data){
          this.workData.destinationLP = response.data;    
          this.setFocus('container');      
          this.message = 'Scan container <b>' + ' ' + this.workData.destinationLP + '</b> ';   
          this.fullContainer = dismiss;
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
          if(data.workType == "16"){
            if (data.version == "retail"){
              this.router.navigateByUrl('/pick', { replaceUrl: true });
            }else{
              this.router.navigateByUrl('/pick', { replaceUrl: true });
            }
          }        
        }
      }]
    });
    await alert.present();
  }

  validateWave(e) {
    console.log(this.workData.orderNumber);
    if (e.status === 'success') {  

      this.waveService.getTotesWaveMO(this.getValueInput('wave')).then(
        result => {
          if(result.length > 0){
            this.setFocus('sourceLocation');
          }else{
            this.toastService.changeMessage({ color: 'danger', message: 'Incorrect wave' });
            this.setValueInput('wave', '');
            this.setFocus('wave');
            
          }
        }
      )
      this.setFocus('sourceLocation');
    }
  }


  validateSourceLocation(e) {
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
            this.setFocus('sourceLP');
            this.labelLP = 'Tote';
            this.message = 'Scan <b>Tote</b>';
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


  validateSourceLP(e) {   
    if (e.status === 'success') {
      this.workQService.validateLPWave(
        {
          container : this.getValueInput('sourceLP'),
          wave : this.getValueInput('wave'),
        }
      ).then(result => {
        if( result.code == "success"){
          this.setFocus('item');
          this.message = 'Scan <b>Item</b>';
          this.scanLP = true;
          this.updateContainerQty();
        }else{
          this.setValueInput('sourceLP','');
          this.setFocus('sourceLP');
          this.toastService.changeMessage({ color: 'danger', message: result.message });
        }

      });
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
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


  validateQuantity(e) {
    if (e.status === 'success') {
      if(this.workData.destinationLP == null){//cart logic
        this.presentModalContainer(this.workData.orderNumber, false);
      }else{
      this.setFocus('container');      
      this.message = 'Scan container <b>' + ' ' + this.workData.destinationLP + '</b> ';   
      this.fullContainer = true;
    }
    }else{
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  validateContainer(e) {
    console.log(this.workData.orderNumber);
    if (e.status === 'success') {
      this.workData.pickedQuantity = this.getValueInput('quantity');
      this.completePicking();
    } else {
      this.toastService.changeMessage({ color: 'danger', message:  'Enter container ' + this.workData.destinationLP });
    }
  }
  


  updateContainerQty(){
    this.lpService.getItemsByLocationOrLP(this.getValueInput('sourceLocation'), this.getValueInput('sourceLP')).then(
      result => {
        var qty = 0;
        result.data.forEach(element => {
          qty = qty + element.actualQty;
        });
        this.labelLP = 'Tote ('+ qty+' items)';
      }
    );
  }


  findWork() {
    this.workQService.getWorkPistola(
      {
        workType: this.workType,
        wave: this.getValueInput('wave'),
        locationId: this.getValueInput('sourceLocation'),
        lp: this.getValueInput('sourceLP'),
        itemNumber: this.itemNumber,
        displayItemNumber: this.getValueInput('item'),
      }
    ).then(
      (result) => {
         
        if (result.code === 'work_assigned' && result.data.workType !== this.workType) {
          this.presentAlertWork(result.data);
          return;
        }
       
        if (result.message !== 'error') {
          this.workData = result.data;         
          this.setFocus('quantity');
          this.labelQuantity = 'Quantity (<=' + this.workData.plannedQuantity + ')';
          this.message = 'Pick <b>' + ' ' + this.workData.plannedQuantity + '</b> ' + 'pieces';            
            
        } else {
          this.setValueInput('item', '');            
          this.setFocus('item');
          if (result.code === 'item_not_on_lp') {
            this.toastService.changeMessage({ color: 'danger', message: 'Item not in LP' });
            return;
          }
          this.toastService.changeMessage({ color: 'danger', message: result.code });
        }
      },
      (error) => console.log(error)
    );
  }


  completePicking() {
    console.log('workComplete');
    this.workData.destinationLocation = "MANUALSTAGE-01";
    this.workQService.workComplete(this.workData).subscribe(
      (result) => {
        this.setValueInput('item', '');
        this.setValueInput('container', '');
        if (result.code !== 'no_more_work') {
          if(result.code == 'no_more_items_in_container'){
            this.labelLP = 'Tote';
            this.message='Scan <b>Tote</b>';
            this.toastService.changeMessage({ color: 'success', message: "No more items in Tote <b>"+this.getValueInput('sourceLP')+'</b>', duration: 5000 });
            this.setValueInput('sourceLP', '');
            this.setValueInput('quantity', ''); 
            this.labelQuantity = 'quantity';
            this.setFocus('sourceLP');
          } else if (result.code == 'no_more_items_to_sort'){
            this.labelLP = 'Tote';
            this.message='Scan <b>Tote</b>';
            this.toastService.changeMessage({ color: 'success', message: "No more items to sort in Tote <b>"+this.getValueInput('sourceLP')+'</b>', duration: 5000 });
            this.setValueInput('sourceLP', '');
            this.setValueInput('quantity', ''); 
            this.labelQuantity = 'quantity';
            this.setFocus('sourceLP');
          }else if(result.code == 'qty_wrong'){
            this.setValueInput('container', '');
            this.setFocus('container');
            this.toastService.changeMessage({ color: 'danger', message: result.message, duration: 5000 });
            this.message = 'Scan <b>container</b>';
          } else {
            this.toastService.changeMessage({ color: 'success', message: "Item moved to "+this.workData.destinationLP, duration: 5000 });
            this.message = 'Scan new <b>item</b>'
            this.setFocus('item');
            this.setValueInput('quantity', '');   
            this.labelQuantity = 'Quantity'; 
            this.fullContainer = false;
            this.updateContainerQty();
          }
        } else {
          this.setValueInput('sourceLP', '');
          this.setFocus('sourceLP');
          this.message='Scan <b>LP</b>';
        }
      },
      (error) => console.log('error - completeWork')
    );
  }

  scanOtherLP(){
    this.setFocus('sourceLP');
    this.setValueInput('sourceLP','');
    this.setValueInput('item','');
    this.setValueInput('quantity','');
    this.setValueInput('container','');
    this.labelLP = 'Tote';
    this.labelQuantity = 'Quantity';    
    this.message = 'Scan <b>LP</b>';
    this.fullContainer = false;
  }


  setFocus(field: string) {
    let reference;
    switch (field) {
      case 'wave': {
        reference = this.waveRef;
        break;
      }
      case 'sourceLocation': {
        reference = this.sourceLocationRef;
        break;
      }
      case 'sourceLP': {
        reference = this.sourceLPRef;
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
      case 'container': {
        reference = this.containerRef;
      }
    }
    setTimeout(() => {
      if(reference != null){
          reference.setFocus();
      }
    }, 300);  
  }

}
