import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormAms } from '@app/_general/form-ams';
import { Adjust } from '@app/_models/adjust';
import { CommonService } from '@app/_services';
import { HeaderService } from '@app/_services/header.service';
import { InventoryService } from '@app/_services/inventory.service';
import { ToastService } from '@app/_services/toast.service';
import { AuthenticationService } from '@app/_services';

@Component({
  selector: 'app-bbsort',
  templateUrl: './bbsort.page.html',
  styleUrls: ['./bbsort.page.scss'],
})
export class BBSortPage extends FormAms implements OnInit, OnDestroy {
  @ViewChild('sourceLocation', { static: true }) sourceLocationRef;
  @ViewChild('gaylord', { static: true }) gaylordRef;
  @ViewChild('item', { static: true }) itemRef;
  @ViewChild('destLocation', { static: true }) desLocationRef;
  @ViewChild('destHu', { static: true }) destHuRef;

  itemNumber;
  prefix;
  destinationLoc = null;
  user;
  newLP = false;
  huId;
  isSD=false;
  isSDDisabled = false;

  constructor(
    public authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private headerService: HeaderService,
    private inventoryService: InventoryService,
    private toastService: ToastService,
    private commonService: CommonService
  ) {
    super();
  }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      sourceLocation: [''],
      gaylord: [''],
      item: [''],
      destHu: [''],
      destLocation: [{ value: '', disabled: true }]
    });

    this.subscription = this.headerService.currentMessage.subscribe(header => {
      if (header === 'clear') {
        console.log('sortout');
        this.isSD = false;
        this.resetForm();
      }
    })

  }

  resetForm() {
    this.isSDDisabled = false;
    if(this.isSD){
      this.sourceLocationRef.setFocus();
      this.message ='Scan <b>Location</b>' ;
    }else{
      this.itemRef.setFocus();
      this.message ='Scan <b>Item Number</b>' ;
    }
    this.formGroup.reset();
  }


  async presentToast(message, color) {
    const toast = await this.toastService.changeMessage({
      header: message,
      color: color,
      duration: 6000
    });
  }


  ionViewWillEnter() {
    this.itemRef.setFocus();
    this.message = 'Scan <b>Item Number</b>';
  }


  validateSourceLocation(e){
    if (e.status === 'success') {      
      this.isSDDisabled = true;
      this.gaylordRef.setFocus();      
      this.message ='Scan <b>Gaylord/LP</b>' ;
    }else{
      this.toastService.changeMessage({message: e.data, color: 'danger'});
    }
  }


  validateGaylord(e){
    if (e.status === 'success') {
      if(e.data.startsWith('TJ-BB-')){
        this.itemRef.setFocus();
        this.message ='Scan <b>Item</b>' ;
      }else{
        this.toastService.changeMessage({message: 'Invalid Gaylord', color: 'danger'});
        this.setValueInput('gaylord', '');
        this.gaylordRef.setFocus();
      }
    }else{
      this.toastService.changeMessage({message: e.data, color: 'danger'});
    }
  }


  validateItem(e) {
    console.log(e);
    this.itemNumber = e.data.itemNumber;
    let loc = this.getValueInput('sourceLocation');
    let lp = this.getValueInput('gaylord');

    if (e.status === 'success') {  
      this.isSDDisabled = true;
      if(this.isSD){
        console.log(e.data);
        if(!e.data.inventory.some( i => i.huId ==  lp && i.locationId == loc)){
          this.setValueInput('item','');
          this.itemRef.setFocus();
          this.toastService.changeMessage({ message: "Item does not exist", color: 'danger' });
          return;
        }
      }

      this.inventoryService.getbbDestLocation(this.itemNumber).then(result => {
        if (result.palPrefix == 'BB') {
          this.destinationLoc =result.location2;
          this.desLocationRef.setFocus();
          this.message = 'Scan <b>BB</b>: ' + ' ' + result.location2;
        } else {
          this.destinationLoc = null;
          this.newLP = true;          
          this.prefix = 'PAL-'+result.palPrefix;
          this.message = 'Scan <b>PAL-'+result.palPrefix+'</b> License Plate';
          this.destHuRef.setFocus();            
        }
      }
      );
    }
    else {
      this.itemRef.setFocus();
      this.toastService.changeMessage({ message: "Item does not exist", color: 'danger' });
    }
  }


  validateDestLocation(e){
    if (e.status == 'success'){
      if(e.data.locationId != this.destinationLoc ){
        this.desLocationRef.setFocus();
        this.setValueInput('destLocation','');
        this.toastService.changeMessage({message: 'Location does not match', color: 'danger'});
      } else{ //increment to location
        this.adjust();        
      }
    }
    else{
      this.toastService.changeMessage({message: e.data, color: 'danger'})
    } 
  }


  validateDestHu(e){
    if(e.status =='success'){
      var prefix2 = e.data.substring(0,6);
      if(prefix2 != this.prefix){
        this.destHuRef.setFocus();
        this.setValueInput('destHu','');
        this.toastService.changeMessage({message: 'Incorrect License Plate Scan', color: 'danger'});
      }
      else{
        this.huId = e.data;
        this.adjust();
      }
    }
    else{
      this.setValueInput('destHu','');
      this.toastService.changeMessage({message: e.data, color: 'danger'});
    }
  }


  adjust() {
    const adjust: Adjust = new Adjust();
    adjust.whId = '01';
    adjust.clientId = 1;
    adjust.itemNumber = this.itemNumber;
    adjust.sourceLocation = ((this.destinationLoc === null)? 'RETURNSTAGE-01': this.destinationLoc);
    adjust.sourceLP = ((this.huId === null) ? null : this.huId);
    adjust.quantity = 1;
    adjust.employeeId = this.authenticationService.currentUserValue.userDetails.id;
    adjust.transactionCode = '543';
    adjust.transactionDescription = 'Increment Inventory';
    adjust.transactionControlNumber = 'ADJUST';
    if(this.isSD){
      adjust.sourceLocation = this.getValueInput('sourceLocation');
      adjust.sourceLP =  this.getValueInput('gaylord');      
      adjust.destinationLocation = ((this.destinationLoc === null)? 'RETURNSTAGE-01': this.destinationLoc);
      adjust.destinationLP = ((this.huId === null) ? null : this.huId);
      adjust.transactionControlNumber = null;
      adjust.transactionCode = '201';      
      adjust.transactionDescription = ((this.destinationLoc === null)? 'Move BB to Zone': 'BB Sort');

      this.commonService.moveItem(adjust).then(result => {
        if (result.code === "success") {
          this.toastService.changeMessage({ message: 'Item Moved', color: 'success' });
          this.setValueInput('item','');
          this.setValueInput('destHu','');
          this.setValueInput('destLocation','');
          this.message = 'Scan <b>Item</b>';
          this.itemRef.setFocus();
        } else {
          this.toastService.changeMessage({ message: result.message, color: 'danger' });
        }
      });
    }else{
      this.commonService.saveInventory(adjust).then(result => {
      if (result.code === 'success') {
          this.toastService.changeMessage({ message: 'Item Incremented ',color: 'success' });  
          this.resetForm();    
       } else {
        this.toastService.changeMessage({ message: result.message, color: 'danger' });
      }      
    });

    }
    
  }


  onToggleSanDiego(checked){
    this.isSD = checked; 
    this.resetForm();   
  }


}



