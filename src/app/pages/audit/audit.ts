import { CommonService } from '@app/_services/common.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, ViewChild, OnInit } from '@angular/core';
import { HeaderService } from '@app/_services/header.service';
import { ToastService } from '@app/_services/toast.service';
import { AuditService } from '@app/_services/audit.service';
import { LPService } from '@app/_services/lp.service';
import { AuditItems, Audit, AuditLP } from '@app/_models/audit';

@Component({
  selector: 'inventory-audit',
  templateUrl: 'audit.html',
  styleUrls: ['./audit.scss'],
})
export class AuditPage implements OnInit {
  @ViewChild('inputLocation', { static: true }) locationRef;
  @ViewChild('lp', { static: true }) lpRef;
  @ViewChild('item', { static: true }) itemRef;
  @ViewChild('qty', { static: true }) qtyRef;
  @ViewChild('grid', { static: true }) gridRef;


  myForm: FormGroup;
  showResults = false;
  items: Array<AuditItems> = [];
  maxValue = 1000;
  upc;
  quantity;
  location;
  lp;
  hideHeaderCard = false;
  isFinished = false;
  passFail = false;
  showButtonBack = false;
  singleUnit = false;

  constructor(
    private auditSerice: AuditService,
    private commonService: CommonService,
    private toastService: ToastService,
    private headerService: HeaderService,
    private formBuilder: FormBuilder
  ) {
  }


  onToggleBtnChange(checked) {
    this.singleUnit = checked;
  }


  resetForm() {
    this.myForm.reset();
    this.hideHeaderCard = false;
    this.items = [];
    this.locationRef.setFocus();
  }


  ngOnInit() {
    this.myForm = this.formBuilder.group({
      location: [''],
      lp: [''],
      item: [''],
      quantity: ['']
    });

    this.location = this.myForm.controls['location'];
    this.quantity = this.myForm.controls['quantity'];
    this.lp = this.myForm.controls['lp'];
    this.upc = this.myForm.controls['item'];

    this.headerService.currentMessage.subscribe(header => {
      if (header === 'clear') {
        this.resetForm();
      }
    });

    
  }


  ionViewWillEnter() { 
      this.commonService.getWarehouseControl('AUDIT_MAX_QTY').then(
        result => this.maxValue = result.c1,
        error => console.log(error)
      );
    this.locationRef.setFocus();
  }


  lpMessage(e) {
    if (e.status === 'success') {
      this.setFocus('item');
      this.toastService.changeMessage({ color: 'success', message: 'Enter item.' });
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  itemMessage(e) {
    if (e.status === 'success') {
      if (this.singleUnit === true) {
        this.addUPC();
      }
      else
        this.setFocus('qty');
      this.toastService.changeMessage({ color: 'success', message: 'Enter a quantity' });
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  locationMessage(e) {
    if (e.status === 'success') {
      if (e.data.itemHuIndicator === 'H' || e.data.itemHuIndicator === 'B') {
        this.setFocus('lp');
        this.toastService.changeMessage({ color: 'success', message: 'Enter LP!' });
      } else {
        this.setFocus('item');
        this.toastService.changeMessage({ color: 'success', message: 'Enter Item' });
      }
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  quantityMessage(e) {
    if (e.status === 'success') {
      this.addUPC();
    } else {
      this.toastService.changeMessage({ color: 'danger', message: e.data });
    }
  }


  scanItem() {
    this.upc.setValue('');
    this.setFocus('item');
  }


  setFocus(field: string) {
    this.showButtonBack = false;
    switch (field) {
      case 'location': {
        this.locationRef.setFocus();
        break;
      }
      case 'lp': {
        this.lpRef.setFocus();
        break;
      }
      case 'item': {
        this.upcFocus();
        this.itemRef.setFocus();
        break;
      }
      case 'qty': {
        this.qtyRef.setFocus();
        this.showButtonBack = true;
      }
    }
  }


  removeItem(item) {
    this.items.forEach((line, index) => {
      if (item === line) { this.items.splice(index, 1); }
    });
  }


  clear() {
    this.items = [];
  }

  upcFocus() {
    this.hideHeaderCard = true;
  }

  addUPC() {
    if (this.isFinished) {
      this.clear();
      this.isFinished = false;
    }

    const item: AuditItems = new AuditItems();
    item.scannedQuantity = ((this.singleUnit === true) ? 1 : this.quantity.value);
    item.upc = this.upc.value;
    this.items.push(item);
    this.upc.setValue('');
    this.quantity.setValue('');
    this.showResults = false;
    this.setFocus('item');
  }


  submitAudit() {
    const lps: Array<AuditLP> = [];
    const lp: AuditLP = new AuditLP();
    let ToastMessage = ' ';
    let ToastColor = ' ';
    let auditSuccess = true;
    lp.LP = (this.lp.value === '') ? null : this.lp.value;
    lp.items = this.items;
    lps.push(lp);


    let aud: Audit = new Audit();
    aud.location = this.location.value;
    aud.type = (this.lp.value === '') ? null : this.lp.value;
    aud.lps = lps;

    this.auditSerice.submitAudit(aud)// call service
      .subscribe(resp => {
        aud = resp;
        this.items = aud.lps[0].items;
        this.showResults = true;

        aud.lps[0].items.forEach(function (item) {
          if (auditSuccess && item.scannedQuantity === item.actualQuantity) {
            ToastMessage = 'Audit Passed.';
            ToastColor = 'success';
            auditSuccess = true;
            item.weight = 0;
          } else {
            item.weight = item.scannedQuantity > item.actualQuantity ? 1 : 2;
            if (item.scannedQuantity !== item.actualQuantity && item.scannedQuantity !== 0 && item.actualQuantity !== 0) {
              item.weight = 1;
            }
            if (item.scannedQuantity === 0 && item.actualQuantity !== 0) {
              item.weight = 2;
            }
            if (item.scannedQuantity > 0 && item.actualQuantity === 0) {
              item.weight = 3;
            }
            auditSuccess = false;
            ToastMessage = 'Audit Failed.';
            ToastColor = 'danger';
          }
        });

        aud.lps[0].items.sort((a, b) => (b.weight > a.weight) ? 1 : ((a.weight > b.weight) ? -1 : 0));
        this.passFail = auditSuccess;
        this.toastService.changeMessage({ color: ToastColor, message: ToastMessage });
        this.isFinished = true;
      });
  }
}
