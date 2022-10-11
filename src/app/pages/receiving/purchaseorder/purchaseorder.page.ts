import { HeaderService } from './../../../_services/header.service';
import { ToastService } from './../../../_services/toast.service';
import { CommonService } from './../../../_services/common.service';
import { ReceivingService } from './../../../_services/receiving.service';
import { ModalPage } from './modal-page';
import { AuthenticationService } from './../../../_services/authentication.service';
import { Receiving } from './../receiving.model';
import { ModalController } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-purchaseorder',
  templateUrl: './purchaseorder.page.html',
  styleUrls: ['./purchaseorder.page.scss'],
})
export class PurchaseorderPage implements OnInit {
  @ViewChild('poNumber', { static: true }) poNumberRef;
  @ViewChild('stagingLocation', { static: true }) stagingLocationRef;
  @ViewChild('cartonId', { static: true }) cartonIdRef;
  @ViewChild('licensePlate', { static: true }) licensePlateRef;
  @ViewChild('client', { static: true }) clientRef;

  formGroup: FormGroup;

  readyToSave = false;
  item = '';
  quantity = null;
  location;
  lp = '';
  licenseTo: string;
  cartonInformation: any;
  receiving: Receiving;
  prefix: string;
  user;
  selectedClient;

  constructor(
    private authenticationService: AuthenticationService,
    private commonService: CommonService,
    private toastService: ToastService,
    private headerService: HeaderService,
    private formBuilder: FormBuilder,
    private receivingService: ReceivingService,
    private modalController: ModalController
  ) {
    this.receiving = new Receiving();
  }


  resetForm() {
    this.formGroup.reset();
    this.setFocus('client');
  }


  getValueInput(input) {
    return this.formGroup.controls[input].value;
  }


  setValueInput(input, value) {
    this.formGroup.get(input).setValue(value);
  }


  ngOnInit() {
    this.licenseTo = 'License Plate';
    this.formGroup = this.formBuilder.group({
      location: [{ value: '', disabled: true }],
      cartonId: [{ value: '', disabled: true }],
      poNumber: [{ value: '', disabled: true }],
      licensePlate: [{ value: '', disabled: true }],
      client: [{ value: '', disabled: false }]
    });

    this.headerService.currentMessage.subscribe(header => {
      if (header === 'clear') {
        this.resetForm();
      }
    });
  }


  ionViewWillEnter() {        
    setTimeout(() => {this.user = this.authenticationService.currentUserValue.userDetails; this.setFocus('client');}, 50);
  }

  validateClient(e){    
    if(e.status == 'success'){
      this.selectedClient = e.data;
      this.setFocus('location');
    }
   }
 

  async presentModal(data) {
    const modal = await this.modalController.create({
      component: ModalPage,
      cssClass: 'my-custom-class',
      componentProps: {
        data
      }
    });

    modal.onDidDismiss().then(
      response => {
        if (response.data) {
          this.stepLicensePlate(response.data);
        } else { // If you cancel
          this.setValueInput('cartonId','');
          this.setFocus('cartonId');
        }
      });

    return await modal.present();
  }


  validateLocationMessage(e) {
    if (e.status === 'success') {
      this.location = e.data.locationId;
      this.setFocus('cartonId');
      this.toastService.changeMessage({ color: 'success', message: 'Enter Carton!' });
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  validateCartonId(e: any): void {
    if (e.status === 'success') {
      const cartonId = this.getValueInput('cartonId');
      this.receivingService.getCartonIdInformation(this.selectedClient.clientId, cartonId).then(
        (result) => {
          if (result) {
            console.log(result);
            if (result.status === 'RECEIPT') {
              this.toastService.changeMessage({ color: 'danger', message: 'This box(' + cartonId + ') was received.' });
              this.setValueInput('cartonId','');              
              this.setFocus('cartonId');
            } else if (result.status === 'FOUND') {
              this.presentModal(result);
            } else if (result.status === 'NOTFOUND') {
              this.toastService.changeMessage({ color: 'danger', message: 'This box(' + cartonId + ') is not found.' });
              this.setValueInput('cartonId','');              
              this.setFocus('cartonId');
            }
          } else {
            this.toastService.changeMessage({ color: 'danger', message: 'Invalid Order' });
            this.setValueInput('cartonId','');              
            this.setFocus('cartonId');
          }
        },
        (error) => {
          this.toastService.changeMessage({ color: 'danger', message: 'Problems with conexion' });
        }
      );
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }

  validateLicensePlate(e): void { // ← ← ←
    if (e.status === 'success') {
      const lp = this.getValueInput('licensePlate');

      if (lp.startsWith(this.prefix)) {

        const itemsAdjust = [];
        const receipt = [];
        const dateTime = (moment(new Date())).format('YYYY-MM-DD HH:mm:ss');

        this.cartonInformation.detail.forEach(
          item => {
            itemsAdjust.push({
              whID: '01',
              itemNumber: item.itemNumber,
              sourceLocation: this.getValueInput('location'),
              sourceLP: lp,
              quantity: item.quantity,
              sourceLPType: 'IV',
              employeeId: this.user.id,
              transactionCode: '151',
              transactionDescription: 'Inbound Order Receipt (Rcpt App)',
              transactionControlNumber: this.cartonInformation.poNumber,
              clientId : this.selectedClient.clientId,
              SendHostMessage: false
            });

            receipt.push({
              PoNumber: this.cartonInformation.poNumber,
              ReceiptDate: dateTime,
              ItemNumber: item.itemNumber,
              LineNumber: item.lineNumber,
              ScheduleNumber: 0,
              HuId: this.getValueInput('licensePlate'),
              QtyReceived: item.quantity,
              QtyDamaged: 0,
              ForkId: 'VF' + this.user.id,
              TranStatus: 'H',
              WhId: '01',
              VsnCartonId: this.cartonInformation.cartonId,
              VsnShipmentNumber: this.cartonInformation.shipmentNumber,
              clientId : this.selectedClient.clientId,
              SendHostMessage: false
            });
          }
        );

       // if (itemsAdjust.length > 1) { 
          
          this.commonService.saveInventoryBlock({ adjusts: itemsAdjust }).then(
            result => {
              if( result.code == 'success'){
                this.receivingService.saveReceipt(receipt)
                .then(responses => {            
                   console.log(responses);
                   this.returnToCartonId();
                 }, reason => this.toastService.changeMessage({ color: 'danger', message: 'Problems saving the box.' })
                 );
              }else{
                this.toastService.changeMessage({ color: 'danger', message: 'Problems saving the box.' });
              }
            }
          );

         
      /*  } else {
          Promise.all([
            this.commonService.saveInventory(itemsAdjust[0]),
            this.receivingService.saveReceipt(receipt)
          ]).then(values => {
            console.log(values);
            this.returnToCartonId();
          }, reason => this.toastService.changeMessage({ color: 'danger', message: 'Problems saving the box.' })
          );
        }*/

      } else {
        this.setValueInput('licensePlate','');
        this.setFocus('licensePlate');
        this.toastService.changeMessage({ color: 'danger', message: 'Invalid License Plate' });
      }
    }
  }


  stepLicensePlate(data) {
    this.cartonInformation = data;
    this.formGroup.get('poNumber').setValue(this.cartonInformation.poNumber);
    if (this.cartonInformation.detail.length > 1) {
      this.prefix = 'PAL-FLR-';
      this.setFocus('licensePlate');
      this.licenseTo = 'License Plate to Floor';
    } else {
      this.receivingService.getDestinationPal(this.cartonInformation.detail[0].itemNumber).then(
        (result) => {
          if (result.code === 'success') {
            this.setFocus('licensePlate');
            switch (result.message) {
              case 'AUTOSTORE':
                this.prefix = 'PAL-AUS-';
                this.licenseTo = 'License Plate to Autostore';
                break;
              case 'FLOOR':
                console.log("pal-flr");
                this.prefix = 'PAL-FLR-';                
                this.licenseTo = 'License Plate to Floor';
                break;
              case 'AIR':
                this.prefix = 'PAL-AIR-';
                this.licenseTo = 'License Plate to Air';
                break;
            }
          } else {
            this.toastService.changeMessage({ color: 'danger', message: 'Contact Support.' });
          }
        },
        (error) => this.toastService.changeMessage({ color: 'danger', message: 'Problems saving the box.' })
      );
    }
    this.readyToSave = true;
  }


  returnToCartonId() {
    this.setValueInput('cartonId','');
    this.setValueInput('poNumber','');
    this.setValueInput('licensePlate','');
    this.toastService.changeMessage({ color: 'success', message: 'Carton saved.' });
    this.setFocus('cartonId');
    this.licenseTo = 'License Plate';
    this.readyToSave = false;
  }


  setFocus(field: string) {
    switch (field) {
      case 'location': {
        this.stagingLocationRef.setFocus();
        break;
      }
      case 'cartonId': {
        this.cartonIdRef.setFocus();
        break;
      }
      case 'licensePlate': {
        this.licensePlateRef.setFocus();
        break;
      }
      case 'client': {
        this.clientRef.setFocus();
        break;
      }
    }
  }


}
