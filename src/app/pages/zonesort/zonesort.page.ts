import { ModalDetailPage } from './modaldetail/modaldetail-page';
import { Adjust } from '@app/_models/adjust';
import { CommonService } from '@app/_services/common.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ModalController } from '@ionic/angular';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { FormAms } from '@app/_general/form-ams';
import { LPService } from '@app/_services/lp.service';
import { HeaderService } from '@app/_services/header.service';
import { WorkQService } from '@app/_services/workq.service';
import { ToastService } from '@app/_services/toast.service';

@Component({
  selector: 'app-zonesort',
  templateUrl: './zonesort.page.html',
  styleUrls: ['./zonesort.page.scss'],
})
export class ZoneSortPage extends FormAms implements OnInit, OnDestroy {
  @ViewChild('sourceLocation', { static: true }) sourceLocationRef;
  @ViewChild('tote', { static: true }) toteRef;
  @ViewChild('destLocation', { static: true }) destLocationRef;
  @ViewChild('item', { static: true }) itemRef;
  @ViewChild('destHuId', { static: true }) destHuRef;

  labelTote = 'Tote';
  destinationLocation = '';
  showBtnTote = false;
  itemNumber = '';
  newLP = true;
  clientId = 1;

  constructor(
    private workQService: WorkQService,
    private lpService: LPService,
    private translateService: TranslateService,
    private commonService: CommonService,
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
      destHuId: [''],
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
    this.labelTote = 'Tote';
    this.message = 'Scan <b>location</b>';     
    this.destinationLocation = '';    
    this.itemNumber = '';
    this.sourceLocationRef.setFocus();
  }


  rescan(){
    this.message = 'Scan <b>tote</b>';   
    this.setValueInput('item','');
    this.setValueInput('destLocation','');
    this.setFocus('tote');

  }


  ionViewWillEnter() {    
    this.workQService.workUnassignwork(null);
    this.sourceLocationRef.setFocus();    
    this.message = 'Scan <b>location</b>'
  }


  async presentModalDetail(detail) { // Modal will show the details that you have in the container    
    const modal = await this.modalController.create({
      component: ModalDetailPage,
      componentProps: {
        data:{
          detail,
          tote: this.getValueInput('tote')
        }
      }
    });
    return await modal.present();
  }


  validateSourceLocation(e) {
    if (e.status === 'success') {     
      let loc = e.data.locationId;
      this.lpService.getItemsByLocationOrLP(loc, null).then((result) => {
        if (result.data.length === 0) {
          this.toastService.changeMessage({ color: 'danger', message: 'Location is empty', duration: 5000 });          
          this.setFocus('sourceLocation');
        } else {
          if (e.data.itemHuIndicator === 'H') {
            this.setFocus('tote');
          } else {
            this.toastService.changeMessage({ color: 'danger', message: this.translateService.instant('INV_LOCATION') });            
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
      this.updateContainerQty();
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  validateItem(e) {
    if (e.status === 'success') { 
      this.clientId = e.data.clientId;     
      this.itemNumber =  e.data.itemNumber;
      this.commonService.getReverseLocation({
        itemNumber : e.data.itemNumber, //MAG033311
        destinationLocation : this.getValueInput('sourceLocation'),
        destinationLP : this.getValueInput('tote')
     }).then(
       result => {
         if(result.code == 'success'){
          this.setFocus('destLocation');          
          this.destinationLocation = result.data;          
          this.message = "Scan location <b>"+ this.destinationLocation+'</b>';          
         }else if(result.code == 'item_not_zone'){
          this.setFocus('destHuId');                  
          this.message = 'Scan <b>PAL-BB-****</b>';          
         }else{
          this.setFocus('item');
          this.toastService.changeMessage({ color: 'danger', message: result.message });
         }
       }
     );
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  validateDestLocation(e) {
    if (e.status === 'success') {
      this.completePicking(0);
    } else {
      this.toastService.changeMessage({ color: 'danger', message: this.translateService.instant('ENTER_LOCATION') + ' ' + this.destinationLocation });
    }
  }  

  validateDestHu(e){
    console.log('ola');
    if(e.status =='success'){
      var prefix2 = e.data.substring(0,6);
      if(!e.data.startsWith('PAL-BB')){
        this.destHuRef.setFocus();
        this.setValueInput('destHuId','');
        this.toastService.changeMessage({message: 'Incorrect License Plate Scan', color: 'danger'});
      }
      else{
        this.completePicking(1);
      }
    }
    else{
      this.setValueInput('destHuId','');
      this.toastService.changeMessage({message: e.data, color: 'danger'});
    }
  }


  updateContainerQty(){
    this.lpService.getItemsByLocationOrLP(this.getValueInput('sourceLocation'), this.getValueInput('tote')).then(
      result => {
        var qty = 0;
        result.data.forEach(element => {
          qty = qty + element.actualQty;
        });        
        
        if(qty == 0){
          this.setValueInput('item','');
          this.setFocus('tote');
          this.showBtnTote = false;
        } else {          
          this.setFocus('item');          
          this.showBtnTote = true;
        }
        this.setValueInput('destHuId','');
        this.setValueInput('destLocation','');
        this.labelTote = 'Tote ('+ qty+' items)';
      }
    );
  }


  detailLP(){
    this.commonService.getReverseLP(this.getValueInput('tote')).then(
      result => {
        this.presentModalDetail(result.data);
      }
    )
  }


  completePicking(type) {  
    const moveitem: Adjust = new Adjust();
    moveitem.clientId = this.clientId;
    moveitem.sourceLocation = this.getValueInput('sourceLocation');
    moveitem.sourceLP = this.getValueInput('tote');
    moveitem.destinationLocation = type == 1? 'RETURNSTAGE-01': this.destinationLocation;
    moveitem.destinationLP = type == 1? this.getValueInput('destHuId'): null;
    moveitem.transactionCode = '201';
    moveitem.transactionDescription = type == 1?'Move Zone to BB':'Zone Sort';
    moveitem.itemNumber = this.itemNumber;
    moveitem.quantity = 1;

    this.lpService.moveItem(moveitem).then( 
      result => {
        if (result.code === "success") {
          this.toastService.changeMessage({ message: 'Item moved to ' + this.destinationLocation, color: 'success' });
          this.updateContainerQty();
        }
      }
    );
  }


  setFocus(field: string) {
    let reference;
    this.setValueInput(field,'');
    switch (field) {
      case 'sourceLocation': {
        reference = this.sourceLocationRef;
        break;
      }
      case 'tote': {
        this.message = 'Scan <b>tote</b>';
        this.labelTote = 'Tote';
        reference = this.toteRef;
        break;
      }
      case 'item': {
        this.message = 'Scan <b>item</b>';
        reference = this.itemRef;
        break;
      }
      case 'item': {
        this.message = 'Scan <b>item</b>';
        reference = this.itemRef;
        break;
      }
      case 'destLocation': {
        reference = this.destLocationRef;
        break;
      }
      case 'destHuId': {
        reference = this.destHuRef;
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
