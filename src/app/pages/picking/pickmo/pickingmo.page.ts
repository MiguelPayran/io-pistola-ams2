import { ModalPage } from './../../receiving/purchaseorder/modal-page';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { FormAms } from '@app/_general/form-ams';
import { CommonService } from '@app/_services/common.service';
import { WaveService } from '@app/_services/wave.service';
import { HeaderService } from '@app/_services/header.service';
import { AuthenticationService } from '@app/_services/authentication.service';
import { LPService } from '@app/_services/lp.service';
import { WorkQService } from '@app/_services/workq.service';
import { WorkData } from '@app/_models/workData';
import { ToastService } from '@app/_services/toast.service';
import { ModalMOPage } from './modalmo-page';
import { ModalCC } from '../modal-cc/modal-cc';
import { ModalClosePick } from '../modal-closepick/modal-closepick';

@Component({
  selector: 'app-pickingmo',
  templateUrl: './pickingmo.page.html',
  styleUrls: ['./pickingmo.page.scss'],
})
export class PickingMOPage extends FormAms implements OnInit, OnDestroy {
  @ViewChild('wave', { static: true }) waveRef;
  @ViewChild('container', { static: true }) containerRef;
  @ViewChild('location', { static: true }) locationRef;
  @ViewChild('lp', { static: true }) lpRef;
  @ViewChild('item', { static: true }) itemRef;
  @ViewChild('quantity', { static: true }) quantityRef;

  labelLocation = 'Location';
  labelItem = 'Item';
  labelQuantity = 'Quantity';
  labelWave = 'Wave';
  dataContainer = '';
  stagingLocation = '';
  details = [];
  workData: WorkData;
  workType = '16';
  shrtBtn = false;
  hospitalPick = false;
  sortStation = 'MANUALSTAGE-01';

  ccPicksAhead = 5;
  ccLimit = 0;
  ccDays = 0;
  ccLastCountDate = false;
  ccData = null;
  ccLoc = null;
  ccItemNumber = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,    
    private modalController: ModalController,
    private toastService: ToastService,
    private storage: Storage,
    private headerService: HeaderService,
    private workQService: WorkQService,
    private lpService: LPService,
    private commonService: CommonService,
    private authenticationService: AuthenticationService,
    private waveService: WaveService
  ) {
    super();
    this.workData = new WorkData();
  }


  ngOnInit() { 
    this.formGroup = this.formBuilder.group({
      wave: '',
      container: [{ value: '', disabled: true }],
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
    console.log('test');
    this.storage.get('closeTote').then(
      (resp) => {
        if (resp != null) {
          this.presentModalCloseTote({
            sortStation: resp.sortStation,
            container: resp.container,
            wave: resp.wave,
            closeIcon: false
          });
        }
      }
    );
  }


  ionViewWillEnter() {  
    this.user = this.authenticationService.currentUserValue.userDetails;

    this.commonService.getWarehouseControl('CC_LIMIT').then(
      result => this.ccLimit = result.c1,
      error => console.log(error)
    );
    this.commonService.getWarehouseControl('PICKS_AHEAD_ASSIGN').then(
      result => this.ccPicksAhead = result.c1,
      error => console.log(error)
    );
    this.commonService.getWarehouseControl('CC_DAYS').then(
      result => this.ccDays = result.c1,
      error => console.log(error)
    );
    this.resetForm();
  }


  resetForm() {
    console.log('resetForm');
    this.hospitalPick = false;
    this.formGroup.reset();
    this.labelLocation = 'Location';
    this.labelItem = 'Item';
    this.labelQuantity = 'Quantity';
    this.labelWave = 'Wave';
    this.dataContainer = '';
    this.details = [];
    this.message = 'Enter <b>wave</b>';
    this.headerService.changeTitle('Picking MO');
    this.workData = new WorkData();
    this.shrtBtn = false;
    this.disableAllFields();
    this.setFocus('wave');
  }


  async presentAlertShortPick() {
    console.log('modal');
    const alert = await this.alertController.create({
      header: 'Is the quantity short?',
      cssClass: 'alertHeader',
      buttons: [{
        text: 'Yes',
        handler: () => {
          this.workData.action = 'SHORT PICK';
          this.workData.pickedQuantity = this.getValueInput('quantity');
          this.shrtBtn = false;
          this.completePicking();
        }
      }, {
        text: 'No',
        handler: () => {
          this.completePicking();
        }
      }, {
        text: 'Cancel',
        handler: () => {
          this.setValueInput('quantity', '');
          this.setFocus('quantity');
        }
      }]
    });
    await alert.present();
  }

  async presentAlertShortPickZero(type?) {
    const alert = await this.alertController.create({
      header: 'Is the quantity short?',
      cssClass: 'alertHeader',
      buttons: [{
        text: 'Yes',
        handler: () => {
          this.workData.action = 'SHORT PICK';
          this.workData.pickedQuantity = 0;
          this.shrtBtn = false;
          this.completePicking();
        }
      }, {
        text: 'Cancel',
        handler: () => {
          const focus = type == 1 ? 'item' : 'quantity';
          this.setValueInput(focus, '');
          this.setFocus(focus);
        }
      }]
    });
    await alert.present();
  }


  async presentAlertWork(data) {
    const alert = await this.alertController.create({
      header: 'You have a work assignment for other process.',
      buttons: [{
        text: 'Continue',
        handler: (blah) => {
          if(data.workType == "16" && data.version == "prestige"){
              this.router.navigateByUrl('/mobile/picking/cart', { replaceUrl: true });
          }
        }
      }
    ]
    });
    await alert.present();
  }


  async presentAlertWorkZone(wave) {
    const alert = await this.alertController.create({
      header: 'You have a picking for other wave, move to wave: ' + wave,
      buttons: [{
        text: 'Continue',
        handler: (blah) => {
          this.resetForm();
        }
      }]
    });
    await alert.present();
  }


  async presentModalDetail() { // Modal will show the details that you have in the container    
    const modal = await this.modalController.create({
      component: ModalPage,
      componentProps: {
        data: {
          details: this.details,
          container: this.dataContainer
        }
      }
    });
    return await modal.present();
  }


  async presentModalCC(data) { // Modal to do Cycle Count    
    const modal = await this.modalController.create({
      component: ModalCC,
      backdropDismiss: false,
      componentProps: {
        data
      }
    });


    modal.onDidDismiss().then(
      response => {
        if (response.data) {

          if (response.data.modalCloseContainer) {
            this.goTote(true);
          } else {
            this.setFocus('location');
          }
        }
        console.log(response);
      });

    return await modal.present();
  }


  async presentModalCloseTote(data) {  
    const modal = await this.modalController.create({
      component: ModalClosePick,
      backdropDismiss: false,
      componentProps: {
        data:{
          stagingLocation:data.sortStation, 
          name:data.container, 
          wave:data.wave
        },
        closeIcon: data.closeIcon
      }
    });

    modal.onDidDismiss().then(
      response => {
        if (response.data) {
          this.workQService.closePickingContainer({
            sortStation: this.sortStation,
            container: response.data.name,
            wave: response.data.wave?response.data.wave:this.workData.orderNumber
          }).then(result2 => {
            if (result2.code === 'success') { // Closing container
              const text = 'Tote <b>' + response.data.name + '</b> moved to <b>' + response.data.stagingLocation + '</b>';
              this.resetForm();
              this.storage.remove('closeTote');
              this.message = text + '.' + this.message;
            }
          },
            error => console.log('error')
          );
        }
        console.log(response);
      });

    return await modal.present();
  }


  fullTote(closeIcon?) {
    console.log('fullTote');
    this.lpService.getItemsByLocationOrLP('VF' + this.user.id, this.getValueInput('container')).then(
      resp => {
        if (resp.data.length > 0) {
          this.presentModalCloseTote({
            sortStation: this.sortStation,
            container: this.getValueInput('container'),
            wave: this.workData.orderNumber,
            closeIcon: closeIcon ? true : false
          });
        } else {
          this.resetForm();
        }
      }
    );
  }


  validateWave(e) {
    if (e.status === 'success') {
      this.findWork();
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data, duration: 20000 });
    }
  }


  findWork() {
    this.workQService.getWorkPistola({
      workType: this.workType,
      version: 'retail',
      wave: this.getValueInput('wave'),
      picksAhead: this.ccPicksAhead
    }).then(
      (result1) => {
        if (result1.code === 'work_assigned' && result1.data.workType == this.workType && result1.data.version != 'retail') {
          this.presentAlertWork(result1.data);
          return;
        }

        if (result1.code === 'work_assigned' && result1.data.workType == this.workType && result1.data.orderNumber !== this.getValueInput('wave')) {
          if(this.getValueInput('wave') == ""){
            this.setValueInput('wave',result1.data.wave);
          } else {
            this.presentAlertWorkZone(result1.data.wave);//Different Zone
            return;
          }
        }
        this.workData = result1.data;
        if (this.workData.workQId === null) {
          if(this.getValueInput('wave') != "" && this.getValueInput('wave') != null){
            this.toastService.changeMessage({ color: 'danger', message: 'No more '+ (this.hospitalPick?'Hospital ':'') +'picks: ' + this.getValueInput('wave'), duration: 2000 });
          }
          
          this.resetForm();
        } else { // Check if there is a container in the fork          
          if (this.dataContainer !== '') {
            this.afterFindWork(this.dataContainer);
            this.getDetail(this.dataContainer);
          } else {
            this.lpService.getLPsByLocation('VF' + this.user.id).then(
              (result) => {
                if (result.length) { // If there are information
                  let container = '';
                  let controlNumber = '';
                  let idx = 0;
                  result.forEach(item => {
                    if (container !== item.huId) {
                      container = item.huId;
                      controlNumber = item.controlNumber;
                      idx++;
                    }
                  });
                  if (idx === 1) {  // with only one lp
                    if(this.workData.orderNumber != controlNumber){                      
                          this.presentModalCloseTote({
                            sortStation: this.sortStation,
                            container: container,
                            closeIcon:  false,
                            wave: controlNumber
                          });                       
                    }
                    this.afterFindWork(container);
                    this.getDetail(container);
                    this.message = 'Scan location' + ' <b>' + this.workData.sourceLocation + '</b>';
                  } else {
                    this.toastService.changeMessage({ color: 'danger', message: 'Items in fork' });
                  }
                } else { // with nothing in FORK
                  this.afterFindWork();
                }
              },
              (error) => console.log(error)
            );
          }
        }
      },
      (error) => console.log(error)
    );
  }


  getDetail(container) {
    this.lpService.getItemsByLocationOrLP('VF' + this.user.id, container).then(
      resp => {
        if (resp.data.length > 0) {
          this.details = [];
          resp.data.forEach(item => {
            this.details.push({
              item: item.items.displayItemNumber,
              quantity: item.actualQty
            });
          });
        }
      },
      error => error);
  }

  
  afterFindWork(container?) {
    this.headerService.changeTitle('Picking MO ('+ this.workData.orderNumber + ')');
    this.updatePickText(this.workData.orderNumber);
    this.hospitalPick = this.workData.waveType == 'H'? true:false;
    if (container) {
      this.dataContainer = container;
      this.setValueInput('container', container);      
      this.setFocus('location');
      this.message = 'Scan location' + ' <b>' + this.workData.sourceLocation + '</b>';
    } else {// without container
      this.setValueInput('container', '');
      this.setFocus('container');
      this.message = 'Enter <b>container</b>'
    }
  }


  completePicking() {
    console.log('workComplete');
    var res = this.getValueInput('quantity') == this.workData.plannedQuantity;

    this.workQService.workComplete(this.workData).subscribe(
      (result) => {
        this.ccItemNumber = this.getValueInput('item');
        this.ccLoc = this.getValueInput('location');
        this.ccData = {
          location: this.ccLoc,
          displayItemNumber: this.getValueInput('item')
        };
        if (result.code === 'no_more_work') { //If you dont have more work , we need to close the container          
          this.cycleCountValidation(true);
        } else if (result.code === 'no_more_qty') { //If you dont have more work , we need to close the container          
          this.setValueInput('quantity','');
          this.setFocus('quantity');
          this.toastService.changeMessage({ color: 'danger', message: 'You can pick '+ result.message + ' more.', duration: 5000 });   
        } else if (result.code === 'problem_location') { //If you dont have more work , we need to close the container          
          this.setValueInput('quantity','');
          this.setFocus('quantity');
          this.toastService.changeMessage({ color: 'danger', message: result.message , duration: 5000 });          
        }  else {
          this.toastService.changeMessage({ color: 'success', message: 'Item saved', duration: 5000 });
          this.getDetail(this.workData.destinationLP);
          this.labelLocation = 'Location';
          this.labelItem = 'Item';
          this.labelQuantity = 'Quantity';
          this.setValueInput('location', '');
          this.setValueInput('lp', '');
          this.setValueInput('item', '');
          this.setValueInput('quantity', '');
          this.stagingLocation = this.workData.stagingLocation;
          this.findWork();
        }
      },
      (error) => console.log('error - completeWork')
    );
  }


  cycleCountValidation(type) {
    if (this.ccLastCountDate) {
      this.lpService.getItemsByLocationOrLP(this.ccLoc, null, null)
        .then(
          (result2) => {
            var qty = 0;
            result2.data.forEach(element => {
              if (element.items.displayItemNumber == this.ccItemNumber) {
                qty = element.actualQty;
              }
            });
            console.log('ccDays:' + this.ccDays);
            console.log('ccLimit:' + this.ccLimit);
            console.log('qty cc in system:' + qty);
            if (qty != 0) {
              if (qty <= this.ccLimit) {
                  console.log('one upc per location');
                  this.presentModalCC({ ...this.ccData, modalCloseContainer: type });               
              } else {
                this.goTote(type);
              }
            } else {
              this.goTote(type);
            }
          }, (error) => console.log('error'));
    }else{
      this.goTote(type);
    }
  }


  goTote(type) {
    if (type) {
      this.fullTote(false);
      this.storage.set('closeTote', {
        workType: '16',
        forkId: 'VF' + this.user.id,
        sortStation: this.sortStation,
        wave: this.workData.orderNumber,
        container: this.getValueInput('container')
      }).then(
        () => {
          console.log('Work Stored');
        }
      );
    }
  }


  validateContainer(e) {
    console.log('test');
    if (e.status === 'success') {
      if (!e.data.startsWith('T-')) {
        this.toastService.changeMessage({ color: 'danger', message: 'Invalid Container' });        
        this.setValueInput('container','');
        this.setFocus('container');
        return;
      }
      this.setFocus('location');
      this.updatePickText(this.workData.orderNumber);
      this.message = 'Scan location' + ' <b>' + this.workData.sourceLocation + '</b>';
      this.labelLocation = this.workData.sourceLocation;
      this.dataContainer = e.data;
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  updatePickText(wave) {
    this.waveService.getWavePicks(wave).then(
      result => {
        result.forEach(item => {
          if (item.wave === this.getValueInput('wave')) {
            this.labelWave = 'Wave (' + item.picks + ' Picks)';
          }
        });
      }
    );
  }


  validateLocation(e): void {
    if (e.status === 'success') {
      if (this.workData.sourceLocation != this.getValueInput('location')) {
        this.setValueInput('location', '');
        this.setFocus('location');
        this.toastService.changeMessage({ color: 'danger', message: 'Enter location: ' + this.workData.sourceLocation });
        return;
      }

      if(this.workData.sourceLP != null) {
        this.setFocus('lp');
        this.message = 'Scan lp' + ' <b>' + this.workData.sourceLP + '<b>';     
        return;
      }

      this.setFocus('item');
      this.labelItem = 'Item' ;
      this.message = 'Scan item' + ' ' + this.workData.displayItemNumber.substring(0, this.workData.displayItemNumber.length - 4) + '<b class="itemNumber">' +
      this.workData.displayItemNumber.substring(this.workData.displayItemNumber.length - 4) + '</b>';
      this.shrtBtn = true;
    } else {
      this.toastService.changeMessage({ color: 'danger', message: 'Enter location: ' + this.workData.sourceLocation });
    }
  }


  validateLP(e): void {
    if (e.status === 'success') {
      if (this.workData.sourceLP != this.getValueInput('lp')) {
        this.setValueInput('lp', '');
        this.setFocus('lp');
        this.toastService.changeMessage({ color: 'danger', message: 'Enter lp: ' + this.workData.sourceLP });
        return;
      }

      this.setFocus('item');
      this.labelItem = 'Item';
      this.message = 'Scan item' + ' ' + this.workData.displayItemNumber.substring(0, this.workData.displayItemNumber.length - 4) + '<b class="itemNumber">' +
      this.workData.displayItemNumber.substring(this.workData.displayItemNumber.length - 4) + '</b>';
      this.shrtBtn = true;
    } else {
      this.toastService.changeMessage({ color: 'danger', message: 'Enter location: ' + this.workData.sourceLocation });
    }
  }


  validateItem(e): void {
    if (e.status === 'success') {
      this.setFocus('quantity');
      this.labelQuantity = 'Quantity (<=' + this.workData.plannedQuantity + ')';
      this.message = 'Pick <b>' + ' ' + this.workData.plannedQuantity + '</b> ' + 'pieces';
      this.shrtBtn = false;
    } else {
      this.toastService.changeMessage({ color: 'danger', message: 'Enter item: ' + this.workData.displayItemNumber });
    }
  }


  validateQuantity(e) {
    const qty = this.getValueInput('quantity') === null ? '' : this.getValueInput('quantity');
    if (qty == 0) {
      this.presentAlertShortPickZero();
      this.workData.pickedQuantity = qty;
    } else {
      if (qty != '') {
        if (e.status === 'success') {
          this.workData.destinationLocation = 'VF' + this.user.id;
          this.workData.destinationLP = this.dataContainer;

          this.workData.pickedQuantity = qty;
          if (qty < this.workData.plannedQuantity) {
            this.presentAlertShortPick();
          } else {
            this.shrtBtn = false;
            this.completePicking();
          }
        } else {
          this.toastService.changeMessage({ color: 'danger', message: e.data });
        }
      } else if (e.data = 'Empty input. Enter a valid quantity.') {
        this.toastService.changeMessage({ color: 'danger', message: e.data });
      }
    }
  }


  setFocus(field: string) {
    let reference;
    switch (field) {
      case 'wave': {
        reference = this.waveRef;
        break;
      }
      case 'container': {
        reference = this.containerRef;
        break;
      }
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
      if(reference != null){
          reference.setFocus();
      }
    }, 300);
  }

}
