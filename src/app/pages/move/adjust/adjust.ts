import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormAms } from '@app/_general/form-ams';
import { AuthenticationService } from '@app/_services';
import { FocusService } from '@app/_services/focus.service';
import { HeaderService } from '@app/_services/header.service';
import { ToastService } from '@app/_services/toast.service';
import { CommonService } from '@app/_services/common.service';
import { Adjust } from '@app/_models/adjust';



@Component({
  selector: 'app-adjust',
  templateUrl: './adjust.html',
  styleUrls: ['./adjust.scss'],
})
export class AdjustComponent extends FormAms implements OnInit {
  @ViewChild('client', { static: false }) clientRef;
  @ViewChild('location', { static: false }) locationRef;
  @ViewChild('lp', { static: false }) LPRef;
  @ViewChild('item', { static: false }) itemRef;
  @ViewChild('quantity', { static: false }) quantityRef;
  @ViewChild('lotNumber', { static: false }) lotNumberRef;
  @Input() sign : number = 1; // To know if is increment o decremt
  @Input() title;


  locationId;
  max = 1500;
  maxValueWC = 1500;
  lotNumber;
  displayItemNumber;
  quantity;
  description;
  transCode;
  newLP = false;
  isPrestigeItem = false;
  listSto = [];
  selectedClient;


  ngOnInit() {
    console.log('aa');
    this.formGroup = this.formBuilder.group({
      location: [{ value: '', disabled: true }],
      lp: [{ value: '', disabled: true }],
      item: [{ value: '', disabled: true }],
      qty: [{ value: '', disabled: true }],
      lotNumber: [{ value: '', disabled: true }],
      client: [{ value: '', disabled: false }]

    });

    if (this.title === 'Decrement') {
        this.description = 'Decrement Inventory';
        this.transCode ='542';
      }else{
        this.description = 'Increment Inventory';
        this.transCode ='543';
    }

    
    this.commonService.getWarehouseControl('ADJUST_MAX_QTY').then(
      result => {
        this.maxValueWC = result.c1;
        this.max = this.maxValueWC;
      },
      error => console.log(error)
    );

  }

  constructor(
    public authenticationService: AuthenticationService,
    public formBuilder: FormBuilder,
    public focusService: FocusService,
    public toastService: ToastService,
    public headerService: HeaderService,
    public commonService: CommonService
  ) {
    super();
  }


  validateClient(e){
    if(e.status == 'success'){
      this.selectedClient = e;
      this.locationRef.setFocus();
    }
   }


  async presentToast(message, color) {
    const toast = await this.toastService.changeMessage({
      header: message,
      color: color,
      duration: 5000
    });
  }


  resetForm() {
    this.formGroup.reset();
    this.clientRef.setFocus();
    this.newLP = this.sign == 1? true:false;//If is increment we can permit new LP    
    this.isPrestigeItem = false;
    this.user = this.authenticationService.currentUserValue.userDetails.id;
  }


  validateLocation(e) {
    console.log(this.user);
    if (e.status === 'success') {
      if (e.data.itemHuIndicator === 'H') {
        this.LPRef.setFocus();
        this.locationId = e.data.locationId
        this.toastService.changeMessage({ message: 'Scan license plate', color: 'success' });
      } else if (e.data.itemHuIndicator === 'I' || e.data.itemHuIndicator === 'M') {
        this.itemRef.setFocus();
        this.locationId = e.data.locationId
        this.toastService.changeMessage({ message: 'Scan item number', color: 'success' });
      }
    } else {
      this.toastService.changeMessage({ message: e.data, color: 'danger' })
    }
  }


  validateLP(e) {
    if (e.status === 'success') {
      this.itemRef.setFocus();
      this.toastService.changeMessage({ message: 'Scan item', color: 'success' })
    } else {
      this.toastService.changeMessage({ message: e.data, color: 'danger' });
    }
  }


  validateItem(e) {   
    let lpInput = this.getValueInput('lp') == ""? null:this.getValueInput('lp'); 
      if (e.status === 'success') {
        if (this.title === 'Decrement') {
          let tstored = e.data.inventory.filter(it => it.locationId === this.getValueInput('location') && it.huId === lpInput);
          if (tstored.length != 0) {
            this.max = tstored[0].actualQty;
            this.listSto = tstored;
            this.quantityRef.setFocus();
            this.displayItemNumber = e.data.itemNumber
            this.toastService.changeMessage({ message: 'Scan quantity', color: 'success' });
          }    
          else {
            this.max = this.maxValueWC;
            this.toastService.changeMessage({ message: 'Item not in' + ' ' + this.locationRef.location.value, color: 'success' });
            this.itemRef.item.setValue('');
            this.itemRef.setFocus();
            return;
          }
        }else{ //Increment
        }

        this.isPrestigeItem = (e.data.amBrand == 'Prestige'? true:false);

        if(this.isPrestigeItem){
          this.lotNumberRef.setFocus();
          this.toastService.changeMessage({ message: 'Scan lot number', color: 'success' });
        }else{
          this.quantityRef.setFocus();
          this.toastService.changeMessage({ message: 'Enter quantity', color: 'success' });
        }
        
        this.displayItemNumber = e.data.itemNumber;
         }
      else {
        this.toastService.changeMessage({ message: e.data, color: 'danger' });        
      }    
  }


  validateLotNumber(e) {
    console.log(e);
    let validLotNumber = false;
    let qty = 0;
    let inputValue = e.data != ""? e.data:null;

    if (this.title !== 'Decrement') {
      this.quantityRef.setFocus();   
      this.toastService.changeMessage({ message: 'Enter quantity', color: 'success' });     
      this.lotNumber = inputValue;
    }else{
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
        this.lotNumberRef.setFocus();
      } else {
        this.max = qty;
        this.quantityRef.setFocus(); 
        this.toastService.changeMessage({ message: 'Enter quantity', color: 'success' });     
        this.lotNumber = inputValue;
      }
    }
  }


  validateQty(e) {
    console.log(e);
    if (e.status === 'failure') {
      this.toastService.changeMessage({ message: 'Quantity to great', color: 'danger' });
    } else if (this.title === 'Decrement') {
      this.quantity = this.getValueInput('qty') * this.sign
      this.adjust();
    } else {
      this.quantity = this.getValueInput('qty')
      this.adjust();
    }
  }


  adjust() {
    console.log(this.displayItemNumber);
    const adjust: Adjust = new Adjust();
    adjust.whId = '01';
    adjust.itemNumber = this.displayItemNumber;
    adjust.lotNumber = this.lotNumber;
    adjust.sourceLocation = this.getValueInput('location');
    adjust.sourceLP = ((this.LPRef.lp.value === null) ? null : this.LPRef.lp.value);
    adjust.quantity = this.quantity;
    adjust.employeeId = this.user;
    adjust.transactionCode = this.transCode;
    adjust.transactionDescription = this.description;
    adjust.transactionControlNumber = 'ADJUST';
    adjust.clientId = this.selectedClient.data.clientId; 
    this.commonService.saveInventory(adjust).then(result => {
      if (result.code === 'success') {
          this.toastService.changeMessage({ message: 'Item '+ (this.title === 'Decrement'? 'Decremented':'Incremented'), color: 'success' });  
          this.resetForm();    
       } else {
        this.toastService.changeMessage({ message: result.message, color: 'danger' });
        if(result.code == 'item_with_alo'){
          this.quantityRef.setFocus();
          this.setValueInput('qty','');
        }
      }


      
    });
  }

}
