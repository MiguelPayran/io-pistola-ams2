import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FocusService } from '@app/_services/focus.service';
import { LPService } from '@app/_services/lp.service';
import { ToastService } from '@app/_services/toast.service';
import { AlertController, ModalController } from '@ionic/angular';
import { LocationService } from '@app/_services/location.service';
import { AuthenticationService } from '@app/_services';
import { Adjust } from '@app/_models/adjust';
import { ItemModalPage } from './item-modal';


@Component({
  selector: 'moveitem',
  templateUrl: './moveitem.html',
  styleUrls: ['./moveitem.scss'],
})

export class MoveItemComponent implements OnInit {
  
  @ViewChild('client', { static: false }) clientRef;
  @ViewChild('sourceLocation', { static: false }) sourceLocationRef;
  @ViewChild('sourceLP', { static: false }) sourceLPRef;
  @ViewChild('sourceQty', { static: false }) sourceQtyRef;
  @ViewChild('sourceItem', { static: false }) sourceItemRef;
  @ViewChild('sourceLotNumber', { static: false }) sourceLotNumberRef;
  @ViewChild('destLocation', { static: true }) destLocationRef;
  @ViewChild('destLP', { static: false }) destLPRef;
  @ViewChild('destQty', { static: false }) destQtyRef;
  @ViewChild('destItem', { static: false }) destItemRef;
  @ViewChild('destLotNumber', { static: false }) destLotNumberRef;


  myForm: FormGroup;
  itemNumber;
  lotNumber;
  items = [];
  sourceLocationId;
  destLocationId;
  max;
  hideCard = false;
  user;
  btnMoveVisible = false;
  btnMoveAllVisible = false;
  fork;
  message;
  isPrestigeItem = false;
  listSto = [];
  selectedClient;
  clientId = 0;


  constructor(
    public formBuilder: FormBuilder,
    public toastService: ToastService,
    public lpService: LPService,
    public focusService: FocusService,
    public alertController: AlertController,
    public modalController: ModalController,
    public locationService: LocationService,
    public authenticationService: AuthenticationService,

  ) { }


  ngOnInit() {
    this.myForm = this.formBuilder.group({
      sourceLocation: [{ value: '', disabled: true }],
      sourceLP: [{ value: '', disabled: true }],
      sourceLotNumber: [{ value: '', disabled: true }],
      destLocation: [{ value: '', disabled: true }],
      destLP: [{ value: '', disabled: true }],
      destLotNumber: [{ value: '', disabled: true }],
      qty: [{ value: '', disabled: true }],
      item: [{ value: '', disabled: true }],
      client: [{ value: '', disabled: true }]
    });
  }

  validateClient(e){
    if(e.status == 'success'){
      this.selectedClient = e;  
      this.message = 'Scan <b>Source location</b>';
      setTimeout(() => this.sourceLocationRef.setFocus(), 400);
    }
  }


   resetToSourceLocation() {
     let cli = this.myForm.controls['client'].value;
    this.myForm.reset();   
    this.myForm.controls['client'].setValue(cli); 
    /*this.setValueInput('sourceLocation','');
    this.setValueInput('sourceLP','');
    this.setValueInput('qty','');
    this.setValueInput('item','');*/
    setTimeout(() => this.sourceLocationRef.setFocus(), 400);
    this.listSto = [];
    this.btnMoveVisible = false;
    this.btnMoveAllVisible = false;
    this.hideCard = false;
    this.isPrestigeItem = false;
    this.message = 'Scan <b>Source location</b>';
    this.user = this.authenticationService.currentUserValue.userDetails.id;
    this.getItemsInFork();
  }


  resetForm() {
    this.myForm.reset();
//    setTimeout(() => this.sourceLocationRef.setFocus(), 400);
    this.listSto = [];
    this.btnMoveVisible = false;
    this.btnMoveAllVisible = false;
    this.hideCard = false;
    this.isPrestigeItem = false;
    this.message = '<b>Choose Client</b>';
    this.user = this.authenticationService.currentUserValue.userDetails.id;
    this.getItemsInFork();
    setTimeout(() => this.clientRef.setFocus(), 400);
  }


  resetDestForm() {
    this.myForm.reset();
    setTimeout(() => this.destLocationRef.setFocus(), 400);
    this.listSto = [];
    this.btnMoveVisible = false;
    this.btnMoveAllVisible = false;
    this.isPrestigeItem = false;
    this.message = 'Scan <b>destination location</b>';
  }


  async presentToast(message, color) {
    const toast = await this.toastService.changeMessage({
      header: message,
      color: color,
      duration: 3000
    });
  }


  async presentModalDetail() {
    const modal = await this.modalController.create({
      component: ItemModalPage,
      componentProps: {
        data: {
          items: this.items
        }

      }
    });
    modal.onDidDismiss().then();
    return await modal.present();
  }


  getValueInput(input) {
    return this.myForm.controls[input].value;
  }


  setValueInput(input, value) {
    this.myForm.get(input).setValue(value);
  }


  validateSourceLocation(e) {
    this.sourceLocationId = e.data.locationId
    this.locationService.getInventoryByLocation(e.data.locationId, null).then(
      (result) => {
        if (result.count === 0) {
          this.setValueInput('sourceLocation','');
          this.sourceLocationRef.setFocus();
          this.toastService.changeMessage({ message: 'Location is Empty', color: 'danger' });
        }
        else {
          if (e.data.itemHuIndicator == 'H') {
            console.log(this.sourceLocationRef.location.value);
            this.sourceLPRef.setFocus();
            this.btnMoveAllVisible = false;
            this.message = 'Scan <b>LP</b>';
          } else if (e.data.itemHuIndicator == 'I' || e.data.itemHuIndicator == 'M') {
            this.sourceItemRef.setFocus();
            this.btnMoveAllVisible = true;
            this.message = 'Scan <b>item</b>';
          } else if (e.data.itemHuIndicator == 'N') {
            result.data.forEach(item => { 
              if( item.huId != null){
                this.sourceLPRef.setFocus();
                this.btnMoveAllVisible = false;
                this.message = 'Scan <b>LP</b>';
              } else{
                this.sourceItemRef.setFocus();
                this.btnMoveAllVisible = true;
                this.message = 'Scan <b>item</b>'; 
              }              
            });
          } else {
            this.toastService.changeMessage({ message: e.data, color: 'danger' });
          }
        }
      });
  }


  validateSourceLP(e) {
    if (e.status == 'success') {
      console.log(this.sourceLPRef.lp.value);
      this.sourceItemRef.setFocus();
      this.btnMoveAllVisible = true;
      this.message = 'Scan <b>item</b>';
    }
    else {
      this.toastService.changeMessage({ message: e.data, color: 'danger' });
    }
  }


  validateSourceItem(e) {
    var text = this.getValueInput('item');     
    let lpInput = this.getValueInput('sourceLP') == ""? null:this.getValueInput('sourceLP');
 
    if (text != '' && text != null && e.status === 'success') {

      let tstored = e.data.inventory.filter(it => it.locationId === this.sourceLocationRef.location.value && it.huId === lpInput);
      if (tstored.length != 0) {
        this.btnMoveAllVisible = false;
        this.listSto = tstored;
        this.listSto.forEach(item => {
          if(item.lotNumber != null){
            this.isPrestigeItem = true;
          }
        });

        if(this.isPrestigeItem){
          this.sourceLotNumberRef.setFocus();
          this.message = 'Enter <b>lot number</b>';

        }else{
          this.lotNumber = null;
          this.max = tstored[0].actualQty;
          this.sourceQtyRef.setFocus();
          this.message = 'Enter <b>quantity</b>';
        }
        this.itemNumber = tstored[0].itemNumber;
        
      }
      else {
        this.toastService.changeMessage({ message: 'Item not in' + ' ' + this.sourceLocationRef.location.value, color: 'danger' });
        this.setValueInput('item','');
        this.sourceItemRef.setFocus();
      }
    } else {
      this.toastService.changeMessage({ message: e.data, color: 'danger' });
    }
  }

  
  validateSourceLotNumber(e) {
    let validLotNumber = false;
    let qty = 0;
    let inputValue = e.data != ""? e.data:null;

    this.listSto.forEach(item => {
      if(item.lotNumber == inputValue){
        validLotNumber = true;
        qty = item.actualQty;
      }
    });

    if (!validLotNumber) {
      this.toastService.changeMessage({ message: 'Incorrect lot number', color: 'danger' });
      this.lotNumber = null;
      this.setValueInput('sourceLotNumber','');
      this.sourceLotNumberRef.setFocus();
    } else {
      this.max = qty;
      this.sourceQtyRef.setFocus();
      this.message = 'Enter <b>quantity</b>';
      this.lotNumber = inputValue;
    }
  }


  validateSourceQty(e) {
    if (e.status === 'failure') {
      this.toastService.changeMessage({ message: e.data, color: 'danger' })
    } else {
      this.itemMove();
      this.btnMoveVisible = true;
    }
  }


  validateCard() {
    setTimeout(() => this.destLocationRef.setFocus(), 300);
    this.hideCard = true
    this.message = 'Scan <b>destination location</b>';
  }


  validateDestLocation(e) {
    console.log(e);
    this.destLocationId = e.data.locationId
    if (e.status == 'success') {
      this.destLocationId = e.data.locationId;
      this.fork = 'VF' + this.user;
      if (e.data.itemHuIndicator === 'I' || e.data.itemHuIndicator === 'M') {
        this.destItemRef.setFocus();
        this.btnMoveAllVisible = true;
        this.message = 'Scan <b>item</b>'
      }
      if (e.data.type === 'E') {
        this.destLPRef.setFocus();
      }
      else if (e.data.itemHuIndicator === 'H') {
        this.destLPRef.setFocus();
        this.message = 'Scan <b>Destination LP</b>'
      }
    }
    else {
      this.toastService.changeMessage({ message: e.data, color: 'danger' });
    }
  }


  validateDestLP(e) {
    console.log(e.data);
    if (e.status === 'failure') {
      this.toastService.changeMessage({ message: e.data, color: 'danger' });
      this.setValueInput('destLP','');
    }
    else if (e.data == 'Invalid LP' || (e.status == 'success')) {
      this.btnMoveVisible = true;
      this.destItemRef.setFocus();
      this.btnMoveAllVisible = true;
      this.message = 'Scan <b>item</b>'
    }
    else {
      console.log(e.data);
      this.toastService.changeMessage({ message: e.data, color: 'danger' });
      this.setValueInput('destLP','');
      this.destLPRef.setFocus();
    }
  }

  getItemId(){    
    this.clientId= this.items.filter(f=> f.displayItemNumber = this.getValueInput('item'))[0].clientId;
    // console.log(this.items.find(f=>{f.displayItemNumber = this.getValueInput('item')}).clientId);
    //     return this.items.find(f=>{f.displayItemNumber = this.getValueInput('item')}).clientId;
  }

  validateDestItem(e) {
    var text = this.getValueInput('item');
    if (text != '' && text != null && e.status === 'success') {
      let tstored = e.data.inventory.filter(it => it.locationId === this.fork);
      if (tstored.length != 0) {
        this.btnMoveAllVisible = false;
        this.listSto = tstored;
        this.listSto.forEach(item => {
          if(item.lotNumber != null){
            this.isPrestigeItem = true;
          }
        });

        if(this.isPrestigeItem){
          this.destLotNumberRef.setFocus();
          this.message = 'Enter <b>lot number</b>';

        }else{
          this.lotNumber = null;
          this.max = tstored[0].actualQty;
          this.destQtyRef.setFocus();
          this.message = 'Enter <b>quantity</b>';
        }
        this.itemNumber = tstored[0].itemNumber;

       }
      else {
        this.toastService.changeMessage({ message: 'Item not in' + ' ' + this.fork, color: 'danger' });
        this.setValueInput('item','');
        this.destItemRef.setFocus();
      }
    } else {
      this.toastService.changeMessage({ message: e.data, color: 'danger' });
      
    }
  }

  
  
  validateDestLotNumber(e) {
    console.log(e);
    let validLotNumber = false;
    let qty = 0;
    let inputValue = e.data != ""? e.data:null;

    this.listSto.forEach(item => {
      if(item.lotNumber == inputValue){
        validLotNumber = true;
        qty = item.actualQty;
      }
    });

    if (!validLotNumber) {
      this.toastService.changeMessage({ message: 'Incorrect lot number', color: 'danger' });
      this.lotNumber= null;
      this.setValueInput('destLotNumber','');
      this.destLotNumberRef.setFocus();
    } else {
      this.max = qty;
      this.destQtyRef.setFocus();
      this.message = 'Enter <b>quantity</b>';
      this.lotNumber = inputValue;
    }
  }


  validateDestQty(e) {
    if (e.status === 'success' && this.btnMoveAllVisible === false) {
      this.itemMove();
    }
    else if (this.btnMoveAllVisible === true) {
      this.LPMove();
    }
    else {
      this.toastService.changeMessage({ message: e.data, color: 'danger' })
      this.setValueInput('qty','');

    }
  }


  itemMove() {
    let notification = '';
    const moveitem: Adjust = new Adjust();
    if (!this.hideCard) { //source locations
      moveitem.sourceLocation = this.getValueInput('sourceLocation');
      moveitem.sourceLP = ((this.getValueInput('sourceLP') === '') ? null : this.getValueInput('sourceLP'));
      moveitem.destinationLP = null;
      moveitem.destinationLocation = 'VF' + this.user;
      moveitem.transactionCode = '201';
      moveitem.transactionDescription = 'Move(Pick)';
      moveitem.clientId = this.myForm.controls['client'].value ;
      notification = 'Item moved to fork';
    }
    else { //sort out 
      moveitem.sourceLocation = 'VF' + this.user;
      moveitem.sourceLP = null;
      moveitem.destinationLP = ((this.getValueInput('destLP') === '') ? null : this.getValueInput('destLP'));
      moveitem.destinationLocation = this.getValueInput('destLocation');
      moveitem.transactionCode = '202';
      moveitem.transactionDescription = 'Move(Put)';
      moveitem.clientId = this.items.filter(f=> f.displayItemNumber = this.getValueInput('item'))[0].clientId;
      notification = 'Item moved to' + ' ' + this.getValueInput('destLocation');

    }
    moveitem.itemNumber = this.itemNumber;
    moveitem.lotNumber = this.lotNumber;
    moveitem.quantity = this.getValueInput('qty');

    this.lpService.moveItem(moveitem).then(result => {
      if (result.code === "success") {
        if (!this.hideCard) {
          this.resetToSourceLocation();
        } else {
          this.getItemsInFork();
        }
        this.toastService.changeMessage({ message: notification, color: 'success' });
      } else {
        this.toastService.changeMessage({ message: result.message, color: 'danger' });
      }
    });
  }


  LPMove() {
    let notification = '';
    const move: Adjust = new Adjust();
    if (!this.hideCard) { //source locations
      move.sourceLocation = this.getValueInput('sourceLocation');
      move.sourceLP = ((this.getValueInput('sourceLP') === '') ? null : this.getValueInput('sourceLP'));
      move.destinationLP = null;
      move.destinationLocation = 'VF' + this.user;
      move.transactionCode = '201';
      move.transactionDescription = 'Move(Pick)';
      notification = 'Location moved to fork';
    }
    else { //sort out 
      move.sourceLocation = 'VF' + this.user;
      move.sourceLP = null;
      move.destinationLP = ((this.getValueInput('destLP') === '') ? null : this.getValueInput('destLP'));
      move.destinationLocation = this.getValueInput('destLocation');
      move.transactionCode = '202';
      move.transactionDescription = 'Move(Put)';
      notification = 'Items moved to' + ' ' + this.getValueInput('destLocation');

    }
    this.lpService.moveLP(move).then(result => {
      if (result.code === "success") {
        if (!this.hideCard) {
          this.resetForm();
        } else {
          this.getItemsInFork();
        }
        this.toastService.changeMessage({ message: notification, color: 'success' });
      } else {
        this.toastService.changeMessage({ message: result.message, color: 'danger' });
      }
    }

    );
  }


  getItemsInFork() {
    if(this.user){
    this.locationService.getInventoryByLocation('VF' + this.user, null).then(
      (result) => {
        if (this.hideCard) {
          if (result.data.length === 0) {
            this.hideCard = false;
            this.btnMoveVisible = false;
            this.btnMoveAllVisible = false;
            this.items = [];
            this.resetForm();
            this.message = 'Scan <b>source location</b>';
          }
          else {
            this.myForm.reset();
            this.destLocationRef.setFocus();
            this.isPrestigeItem = false;
          }
        }
        this.items = [];
        for (let i = 0; i < result.data.length; i++) {
          this.items.push({
            displayItemNumber: result.data[i].items.displayItemNumber,
            lotNumber: result.data[i].lotNumber,
            quantity: result.data[i].actualQty,
            forkHu: result.data[i].huId,
            clientId : result.data[i].clientId
          })
        }
      });
    }
  }
  
}