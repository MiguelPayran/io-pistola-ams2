import { AlertController } from '@ionic/angular';
import { ReceivingService } from './../../../_services/receiving.service';
import { ToastService } from './../../../_services/toast.service';
import { AuthenticationService } from './../../../_services/authentication.service';
import { HeaderService } from './../../../_services/header.service';
import { CommonService } from './../../../_services/common.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-oldpurchaseorder',
  templateUrl: './oldpurchaseorder.page.html',
  styleUrls: ['./oldpurchaseorder.page.scss'],
})
export class OldPurchaseOrderPage implements OnInit, OnDestroy {
  @ViewChild('location', { static: true }) locationRef;
  @ViewChild('ponumber', { static: true }) ponumberRef;
  @ViewChild('item', { static: true }) itemRef;
  @ViewChild('quantity', { static: true }) quantityRef; 
  @ViewChild('lp', { static: true }) lpRef;
  @ViewChild('client', { static: true }) clientRef;


  subscription: Subscription;
  formGroup: FormGroup;
  details = [];
  maxQty = 0;
  extraPer = 0.2;
  prefix: string;
  itemNumber: string;
  user;
  message;
  selectedClient;
  toLocation: string;

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private headerService: HeaderService,
    private receivingService: ReceivingService,
    private commonService: CommonService,
    private authenticationService: AuthenticationService,
    private alertController: AlertController,
  ) {

  }


  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      location: '',
      ponumber: '',
      item: '',
      quantity: [{ value: '', disabled: true }],
      lp: '',
      client: [{ value: '', disabled: false }]
    });

    this.subscription = this.headerService.currentMessage.subscribe(header => {
      if (header === 'clear') {
        this.resetForm();
      }
    });
  }


  validateClient(e){
    if(e.status == 'success'){
      this.selectedClient = e;
      this.setFocus('location');
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  ionViewWillEnter() {
    this.commonService.getWarehouseControl('REC_EXT_PER').then(
      result => this.extraPer = result.c1,
      error => console.log(error)
    );

    setTimeout(() => {
      this.user = this.authenticationService.currentUserValue.userDetails;
    }, 500);
    this.resetForm();
  }


  resetForm() {
    console.log('reset');
    this.formGroup.reset();
    this.details = [];
    this.maxQty = 0;
    this.message = 'Enter <b>location</b>';
    this.headerService.changeTitle('Old Receiving');
    this.itemNumber = '';
    //disable all the fields
    for (const field in this.formGroup.controls) {
        this.formGroup.get(field).disable();
      }    
    this.setFocus('client');
    setTimeout(() => this.user = this.authenticationService.currentUserValue.userDetails, 500);
  }


  getValueInput(input) {
    return this.formGroup.controls[input].value;
  }


  setValueInput(input, value) {
    this.formGroup.get(input).setValue(value);
  }

  
  async presentAlertConfirm(qty) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm Quantity',
      message:  '<p> Are you confirm '+ qty +' items?:</p>',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.setValueInput('quantity','');
            this.setFocus('quantity');
          }
        }, {
          text: 'Ok',
          handler: () => {
            //this.dismiss(this.data);
             this.setFocus('lp');
             this.stepLicensePlate();
          }
        }
      ]
    });

    await alert.present();
  }

  



  validateLocation(e): void {
    if (e.status === 'success') {
      this.setFocus('ponumber');
      this.message = 'Scan <b>PO Number</b>';
    } else {
      this.toastService.changeMessage({ color: 'danger', message: 'Scan a correct PO Number' });
    }
  }


  validatePONumber(e) {
    if (e.status === 'success') {
      this.receivingService.getPONumber(this.getValueInput('ponumber'), this.selectedClient.data.clientId).then(
        result => { 
          if (result.status === 'FOUND') {
            this.setFocus('item');
            this.message = 'Scan  <b>Item</b>';
            this.details = result.detail;
          } else if (result.status === 'NOTFOUND') {
            this.toastService.changeMessage({ color: 'danger', message: 'This PO Number(' + this.getValueInput('ponumber') + ') is not found.' });
            this.setValueInput('ponumber', '');
            this.setFocus('ponumber');
          }
        }
      );

    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data, duration: 20000 });
    }
  }


  validateItem(e): void {
    if (e.status === 'success') {
      this.details.forEach(
        item => {
          if (item.itemNumber == e.data.itemNumber) {
            this.maxQty = item.qty - item.qtyReceipt + Math.round(item.qty * this.extraPer);
            this.itemNumber = item.itemNumber;
          }
        }
      );

      if(e.data.inventory.length > 0 ){
        this.toLocation = 'Air';        
      }
      else{
        this.toLocation = 'Floor';
      }

      if (this.maxQty > 0) {
        this.setFocus('quantity');
        this.message = 'Enter <b>Quantity </b>' + this.toLocation;
      } else {
        this.toastService.changeMessage({ color: 'danger', message: 'Item not in PO or over limit ' });
        this.setValueInput('item','');
        this.setFocus('item');
      }
    } else {
      this.toastService.changeMessage({ color: 'danger', message: 'Enter item: ' });
      this.setFocus('item');
    }
  }


  validateQuantity(e) {
    const qty = this.getValueInput('quantity') === null ? '' : this.getValueInput('quantity');
    if (qty !== '') {
      if (e.status === 'success') {
        this.presentAlertConfirm(qty);
//        this.setFocus('lp');
  //      this.stepLicensePlate();
      } else {
        this.toastService.changeMessage({ color: 'danger', message: e.data });
      }
    } else if (e.data = 'Empty input. Enter a valid quantity.') {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  validateLP(e): void {

    if (e.status === 'success') {
      const lp = this.getValueInput('lp');
      console.log(lp);
      if (lp.startsWith(this.prefix)) {
        console.log("in");
        const itemsAdjust = [];
        const receipt = [];
        const dateTime = (moment(new Date())).format('YYYY-MM-DD HH:mm:ss');

        itemsAdjust.push({
          whID: '01',
          itemNumber: this.itemNumber,
          sourceLocation: this.getValueInput('location'),
          sourceLP: lp,
          quantity: this.getValueInput('quantity'),
          sourceLPType: 'IV',
          employeeId: this.user.id,
          transactionCode: '151',
          transactionDescription: 'Inbound Order Receipt (Old Rcpt App)',
          transactionControlNumber: this.getValueInput('ponumber'),
          clientId : this.selectedClient.data.clientId,
          SendHostMessage: false
        });

        receipt.push({
          PoNumber: this.getValueInput('ponumber'),
          ReceiptDate: dateTime,
          ItemNumber: this.itemNumber,
          LineNumber: 0,
          ScheduleNumber: 0,
          HuId: this.getValueInput('lp'),
          QtyReceived: this.getValueInput('quantity'),
          QtyDamaged: 0,
          ForkId: 'VF' + this.user.id,
          TranStatus: 'H',
          WhId: '01',
          clientId : this.selectedClient.data.clientId,
          SendHostMessage: false
        });

        Promise.all([
          this.commonService.saveInventory(itemsAdjust[0]),
          this.receivingService.saveReceipt(receipt)
        ]).then(values => {
          console.log(values);
          this.returnToItem();
        }, reason => this.toastService.changeMessage({ color: 'danger', message: 'Problems saving the box.' })
        );

    } else {
      this.setValueInput('lp','');
      this.setFocus('lp');
      this.toastService.changeMessage({ color: 'danger', message: 'Invalid License Plate' });
    }
  }
  }

  returnToItem() {
    this.receivingService
      .getPONumber(this.getValueInput('ponumber'), this.selectedClient.id)
      .then(
        result => {
          if (result.status === 'FOUND') {
            this.details = result.detail;
          }
        }
      );

    this.setValueInput('item', '');
    this.setValueInput('quantity', '');
    this.setValueInput('lp', '');
    this.toastService.changeMessage({ color: 'success', message: 'Item received.' });
    this.setFocus('item');
    this.message = 'Scan <b>item</b>';
  }


  stepLicensePlate() {
    this.receivingService.getDestinationPal(this.itemNumber).then(
      (result) => {
        if (result.code.toLowerCase() === 'success') {
          console.log(result);
          this.setFocus('lp');
          switch (result.message) {
            case 'AUTOSTORE':
              this.prefix = 'PAL-AUS-';
              this.message = 'License Plate to Autostore';
              break;
            case 'FLOOR':
              this.prefix = 'PAL-FLR-';
              this.message = 'License Plate to Floor';
              break;
            case 'AIR':
              this.prefix = 'PAL-AIR-';
              this.message = 'License Plate to Air';
              break;
          }
        } else {
          console.log('pal');
          this.toastService.changeMessage({ color: 'danger', message: 'Contact Support.' });
        }
      },
      (error) => this.toastService.changeMessage({ color: 'danger', message: 'Problems saving the box.' })
    );

  }


  setFocus(field: string) {
    let reference;
    switch (field) {
      case 'lp': {
        reference = this.lpRef;
        break;
      }
      case 'ponumber': {
        reference = this.ponumberRef;
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
      case 'quantity': {
        reference = this.quantityRef;
        break;
      }
      case 'client': {
        reference = this.clientRef;
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
