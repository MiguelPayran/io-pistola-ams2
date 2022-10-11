import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, AlertController } from '@ionic/angular';
import { FormAms } from '@app/_general/form-ams';
import { WorkData } from '@app/_models/workData';
import { RedisService } from '@app/_services/redis.service';
import { CommonService } from '@app/_services/common.service';
import { WaveService } from '@app/_services/wave.service';
import { HeaderService } from '@app/_services/header.service';
import { LPService } from '@app/_services/lp.service';
import { AuthenticationService } from '@app/_services/authentication.service';
import { WorkQService } from '@app/_services/workq.service';
import { ToastService } from '@app/_services/toast.service';
import { ModalCC } from '../modal-cc/modal-cc';
import { ModalClosePick } from '../modal-closepick/modal-closepick';
import { ModalTotes } from './modal-totes/modal-totes';
import { ModalDetailTotePage } from './modal-page';

@Component({
  selector: 'app-pickingcart',
  templateUrl: './pickingcart.page.html',
  styleUrls: ['./pickingcart.page.scss'],
})
export class PickingCartPage extends FormAms implements OnInit, OnDestroy {
  @ViewChild('zone', { static: true }) zoneRef;
  @ViewChild('tote', { static: true }) toteRef;
  @ViewChild('location', { static: true }) locationRef;
  @ViewChild('item', { static: true }) itemRef;
  @ViewChild('quantity', { static: true }) quantityRef;

  workData: WorkData;
  labelQuantity = 'Quantity';
  labelZone = 'Zone';
  details = [];
  dataRedis;
  workType = '26';
  shrtBtn = false;
  limitTotes = 2;
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
    private modalController: ModalController,
    private alertController: AlertController,
    private toastService: ToastService,
    private commonService: CommonService,
    private headerService: HeaderService,
    private authenticationService: AuthenticationService,
    private waveService: WaveService,
    private workQService: WorkQService,
    private lpService: LPService,
    private redisService: RedisService
  ) {
    super();
    this.workData = new WorkData();
  }


  ngOnInit() {
    //we initialize the redis object
    this.dataRedis = {
      totes: [],
      zone: '',
      closePick: false,//to know if we neet to move the totes to the sortstages
      hospitalPick: false,
      toogleHospDisable: false
    };

    this.formGroup = this.formBuilder.group({
      zone: '',
      tote: [{ value: '', disabled: true }],
      location: '',
      item: [{ value: '', disabled: true }],
      quantity: [{ value: '', disabled: true }],
    });

    this.subscription = this.headerService.currentMessage.subscribe(header => {
      if (header === 'clear') {
        if(!this.dataRedis.totes.some(tote => tote.hasItems == true)){//we can permit to clean if we dont have items in the fork
          this.resetForm();
        }
      }
    });    
  }


  ionViewWillEnter() {
        //get the user from the session
        this.user = this.authenticationService.currentUserValue.userDetails;
        //get variables from t_whse_control
        this.commonService.getWarehouseControl('CC_LIMIT').then(
          result => this.ccLimit = result.c1,
          error => console.log(error)
        );
        this.commonService.getWarehouseControl('PICKS_AHEAD_ASSIGN').then(
          result => this.ccPicksAhead = result.c1,
          error => console.log(error)
        );
        this.commonService.getWarehouseControl('CART_PICK_TOTES').then(
          result => this.limitTotes = result.c1,
          error => console.log(error)
        );
        this.commonService.getWarehouseControl('CC_DAYS').then(
          result => this.ccDays = result.c1,
          error => console.log(error)
        );
        
  
        this.redisService.getKey(this.user.id).then(
          (resp) => {
            if (resp != null) {
              this.dataRedis = JSON.parse(resp);
              this.setValueInput('zone', this.dataRedis.zone);
              if (this.dataRedis.closePick) {
                this.modalCloseTote(false);
              } else {
                this.findWork();
              }
            } else {
              this.findWork();
            }
          }
        );       
  }


  resetForm() {
    console.log('resetForm');
    this.formGroup.reset();
    this.labelQuantity = 'Quantity';
    this.labelZone = 'Zone';
    this.details = [];
    this.message = 'Enter <b>zone</b>';
    this.headerService.changeTitle('CartPicking');
    this.workData = new WorkData();
    this.shrtBtn = false;
    this.dataRedis = {
      totes: [],
      zone: '',
      closePick: false,
      hospitalPick: false,
      toogleHospDisable: false
    };
    this.disableAllFields();
    this.setFocus('zone');
  }


  async alertFullTote(toteData) {
    if (this.dataRedis.totes.find(tote => tote.workQId == toteData.workQId).hasItems) {
      const alert = await this.alertController.create({
        header: 'Is the tote ' + toteData.name + ' full?',
        buttons:
          [{
            text: 'Yes',
            handler: (blah) => {
              this.workQService.workUnassignwork(toteData.workQId).then(
                result => {
                  this.dataRedis.totes.find(tote => tote.workQId == toteData.workQId).close = true;
                  this.redisService.setKey(this.user.id, JSON.stringify(this.dataRedis));
                  if (!this.dataRedis.totes.some(tote => tote.close == false)) {
                    this.dataRedis.closePick = true;
                    this.redisService.setKey(this.user.id, JSON.stringify(this.dataRedis));
                    this.modalCloseTote(false);
                  }else{                    
                    this.findWork();
                  }
                }
              );
            }
          },
          { text: 'No' }
          ]
      });
      await alert.present();
    }
  }


  async alertShortPick() {
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
          this.message = 'Scan container' + ' <b>' + this.workData.destinationLP + '</b>';         
          this.setFocus('tote');
        }
      }, {
        text: 'No',
        handler: () => {
          this.message = 'Scan container' + ' <b>' + this.workData.destinationLP + '</b>';
          this.setFocus('tote');
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


  async alertShortPickZero(type?) {
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
          let focus = type == 1 ? 'item' : 'quantity';
          this.setValueInput(focus, '');
          this.setFocus(focus);
        }
      }]
    });

    await alert.present();
  }


  async alertItemsInFork(data) {
    const alert = await this.alertController.create({
      header: 'You have items in your fork, contact IT.',
      buttons: [{
        text: 'Continue',
        handler: (blah) => { }
      }]
    });

    await alert.present();
  }


  async alertWork(data) {
    const alert = await this.alertController.create({
      header: 'You have a work assignment for other process.',
      buttons: [{
        text: 'Continue',
        handler: (blah) => {          
          if(data.workType == "26" && data.version == null){
            this.router.navigateByUrl('/mobile/picking/pick', { replaceUrl: true });
          }
        }
      }]
    });

    await alert.present();
  }


  async alertWorkZone(zone) {
    const alert = await this.alertController.create({
      header: 'You have a picking for other zone, move to zone: ' + zone,
      buttons: [{
        text: 'Continue',
        handler: (blah) => {
          this.resetForm();
        }
      }]
    });

    await alert.present();
  }


  async modalDetail() { // Modal will show the details that you have in the container    
    const modal = await this.modalController.create({
      component: ModalDetailTotePage,
      componentProps: {
        data: {
          details: this.details
        }
      }
    });
    return await modal.present();
  }


  async modalTotes(wavesAvailable) { //Modal to get all the totes that you will use for the picking
    const modal = await this.modalController.create({
      component: ModalTotes,
      backdropDismiss: false,
      componentProps: {
        data : { limitTotes : this.limitTotes, wavesAvailable : wavesAvailable }
      }
    });

    modal.onDidDismiss().then(
      response => {
        if (response.data.length > 0) {
          this.dataRedis.totes = response.data;
          this.dataRedis.toogleHospDisable = true ;
          this.findWork();
        }
      });
    return await modal.present();
  }


  async modalCC(data) { // Modal to do Cycle Count    
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
      });
    return await modal.present();
  }


  async modalCloseTote(closeIcon) {
    var toteToClose = this.dataRedis.totes.find(e => e.inSS == undefined);

    if (!toteToClose) {//If there are not more totes to move to the sortstage
      this.resetForm();
      this.redisService.setKey(this.user.id, null).then();//clean the redis object
      return;
    }

    if (toteToClose.hasItems) {
      const modal = await this.modalController.create({
        component: ModalClosePick,
        backdropDismiss: false,
        componentProps: {
          data: toteToClose,
          closeIcon: closeIcon
        }
      });

      modal.onDidDismiss().then(
        response => {
          if (response.data) {
            this.workQService.closePickingContainer({
              sortStation: response.data.stagingLocation,
              container: response.data.name,
              wave: response.data.wave
            }).then(result2 => {
              if (result2.code === 'success') { // Closing container
                const text = 'Tote <b>' + response.data.name + '</b> moved to <b>' + response.data.stagingLocation + '</b>';
                this.message = text + '.' + this.message;
                this.workQService.workUnassignwork(toteToClose.workQId).then();
                this.dataRedis.closePick = true;
                this.dataRedis.totes.find(tote => tote.workQId == toteToClose.workQId).inSS = true;
                this.redisService.setKey(this.user.id, JSON.stringify(this.dataRedis));
                this.modalCloseTote(false);
              }
            },
              error => console.log('error')
            );
          }
        });

      return await modal.present();
    } else {
      this.dataRedis.closePick = true;
      this.dataRedis.totes.find(tote => tote.workQId == toteToClose.workQId).inSS = true;
      this.redisService.setKey(this.user.id, JSON.stringify(this.dataRedis));
      this.workQService.workUnassignwork(toteToClose.workQId).then();
      this.modalCloseTote(closeIcon);
    }
  }


  findWork() {
    console.log('findWork');
    this.workQService.getWorkPistola({
      workType: this.workType,
      version: "v2",
      totes: this.dataRedis.totes,
      waveType: this.dataRedis.hospitalPick ? 'H' : null,
      zone: this.getValueInput('zone'),
      picksAhead: this.ccPicksAhead
    }).then(
      (result1) => {
        this.setValueInput('location', '');
        this.setValueInput('item', '');
        this.setValueInput('quantity', '');
        this.setValueInput('tote', '');
        this.labelQuantity = 'Quantity';

        if (result1.code === 'work_assigned' && result1.data.workType == this.workType && result1.data.version == null) {
          this.alertWork(result1.data);
          return;
        }

        if (result1.code === 'work_assigned' && result1.data.workType == this.workType && result1.data.zone !== this.getValueInput('zone')) {
          this.alertWorkZone(result1.data.zone);//Different Zone
          return;
        }

        if (result1.code === 'items_in_fork') {
          this.alertItemsInFork(result1.data);
          this.setFocus('zone');
          return;
        }

        this.workData = result1.data;
        console.log(this.workData);

        if (this.workData.workQId === null) {
          if(this.getValueInput('zone') != "" && this.getValueInput('zone') != null ){
            this.toastService.changeMessage({ color: 'danger', message: 'No more ' + (this.dataRedis.hospitalPick ? 'Hospital ' : '') + 'waves for this zone: ' + this.getValueInput('zone'), duration: 2000 });
          }
          this.resetForm();
        } else {
          this.afterFindWork();
        }
      },
      (error) => console.log(error)
    );
  }


  getDetail() {
    this.lpService.getItemsByLocationOrLP('VF' + this.user.id, null).then(
      resp => {
        if (resp.data.length > 0) {
          this.details = [];
          resp.data.forEach(item => {
            this.details.push({
              item: item.tItemMaster.displayItemNumber,
              quantity: item.actualQty
            });
          });
          this.modalDetail();
        }
      },
      error => error);
  }

  
  afterFindWork() {
    this.headerService.changeTitle('CartPicking('+this.workData.orderNumber + ')');
    this.updatePickText(this.workData.orderNumber);
    this.dataRedis.hospitalPick = this.workData.waveType == 'H' ? true : false;
    this.setFocus('location');
    this.message = 'Scan location' + ' <b>' + this.workData.sourceLocation + '</b>';
    if (this.workData.action == "new") {
      this.dataRedis.totes = this.workData.totes
              .filter(tote => tote.workQId !== null)
              .sort((a, b) => (a.stagingLocation > b.stagingLocation) ? 1 : -1); //order by sortstage
    }
  }


  completePicking() {
    console.log('workComplete');
    var res = this.getValueInput('quantity') == this.workData.plannedQuantity;
    var bandCC = false;

    this.workQService.workComplete(this.workData).subscribe(
      (result) => {
        this.ccItemNumber = this.getValueInput('item');
        this.ccLoc = this.getValueInput('location');
        this.ccData = {
          location: this.ccLoc,
          displayItemNumber: this.getValueInput('item')
        };
        if(this.workData.pickedQuantity !== 0){
          this.dataRedis.totes.find(tote => tote.workQId == this.workData.workQId).hasItems = true;
        }
        
        if (result.code === 'no_more_work') { //If you dont have more work , we need to close the container          
          this.dataRedis.totes.find(tote => tote.workQId == this.workData.workQId).close = true;          
          bandCC = true;
        } else {
          if (result.code === 'no_more_work_wave') {
            this.dataRedis.totes.find(tote => tote.workQId == this.workData.workQId).close = true;
          }
          this.toastService.changeMessage({ color: 'success', message: 'Item saved.', duration: 5000 });
          this.labelQuantity = 'Quantity';
          this.setValueInput('location', '');
          this.setValueInput('item', '');
          this.setValueInput('quantity', '');
          this.dataRedis.zone = this.getValueInput('zone');          
        }

        this.redisService.setKey(this.user.id, JSON.stringify(this.dataRedis));

        if ( result.code !== 'no_more_work') {
          this.findWork();
        }
        if (res) { this.cycleCountValidation(bandCC); }
        else{
          if(result.code === 'no_more_work'){
            this.goTote(true);
          }
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
                this.modalCC({ ...this.ccData, modalCloseContainer: type });
              } else {
                this.goTote(type);
              }
            } else {
              this.goTote(type);
            }
          }, (error) => console.log('error'));
    } else {
      this.goTote(type);
    }
  }


  goTote(type) {
    if (type) {
      this.dataRedis.closePick = true;
      this.redisService.setKey(this.user.id, JSON.stringify(this.dataRedis));
      this.modalCloseTote(false);
    }
  }


  validateZone(e) {
    if (e.status === 'success') {
      this.workQService.getPickWaves({
        workType: this.workType,
        waveType: this.dataRedis.hospitalPick ? 'H' : null,
        zone: this.getValueInput('zone')
      }).then(
        result => {
          if( result.length == 0){
            this.toastService.changeMessage({ color: 'danger', message: 'No work for this zone : '+ this.getValueInput('zone'), duration: 10000 });
            this.setValueInput('zone','');
            this.setFocus('zone');
          }else{
            this.modalTotes(result.length);
          }
          
        }
      );      
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data, duration: 20000 });
    }
  }


  validateLocation(e): void {
    if (e.status === 'success') {
      this.setFocus('item');
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

      this.workQService.cycleCount(
        {
          sourceLocation: this.getValueInput('location'),
          itemNumber: this.workData.itemNumber,
        }
      ).then(result => {
        if (result == null) {
          this.ccLastCountDate = true;
        } else {
          var diffTime = new Date().getTime() - new Date(result.dateDue).getTime();
          var diffDays = diffTime / (1000 * 3600 * 24);
          this.ccLastCountDate = diffDays > this.ccDays;
          console.log('diffDays: ' + diffDays);
          console.log('lastCountDate: ' + this.ccLastCountDate);
        }
      });
    } else {
      this.toastService.changeMessage({ color: 'danger', message: 'Enter item: ' + this.workData.displayItemNumber });
    }
  }


  validateQuantity(e) {
    const qty = this.getValueInput('quantity') === null ? '' : this.getValueInput('quantity');
    if (qty == 0) {
      this.alertShortPickZero();
      this.workData.pickedQuantity = qty;
    } else {
      if (qty != '') {
        if (e.status === 'success') {
          this.workData.destinationLocation = 'VF' + this.user.id;
          this.workData.pickedQuantity = qty;
          if (qty < this.workData.plannedQuantity) {
            this.alertShortPick();
          } else {
            this.shrtBtn = false;
            this.message = 'Scan container' + ' <b>' + this.workData.destinationLP + '</b>';
            this.setFocus('tote');
          }
        } else {
          this.toastService.changeMessage({ color: 'danger', message: e.data });
        }
      } else if (e.data = 'Empty input. Enter a valid quantity.') {
        this.toastService.changeMessage({ color: 'danger', message: e.data });
      }
    }
  }


  validateTote(e) {
    if (e.status === 'success') {
      this.completePicking();
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  updatePickText(wave) {
    this.waveService.getWavePicks(wave).then(
      result => {
        result.forEach(item => {
          if (item.zone === this.getValueInput('zone')) {
            this.labelZone = 'Zone (' + item.picks + ' Picks)';
          }
        });
      }
    );
  }


  onToggleHospital(checked) {
    this.dataRedis.hospitalPick = checked;
  }


  hasItems(): boolean {
    return this.dataRedis.totes.some(tote => tote.hasItems == true);
  }


  setFocus(field: string) {
    let reference;
    switch (field) {
      case 'zone': {
        reference = this.zoneRef;
        break;
      }
      case 'location': {
        reference = this.locationRef;
        break;
      }
      case 'item': {
        reference = this.itemRef;
        break;
      }
      case 'tote': {
        reference = this.toteRef;
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
