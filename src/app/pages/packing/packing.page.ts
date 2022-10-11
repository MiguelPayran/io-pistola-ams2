import { FormAms } from '@app/_general/form-ams';
import { Router } from '@angular/router';
import { HeaderService } from '@app/_services/header.service';
import { LPService } from '@app/_services/lp.service';
import { WorkData } from '@app/_models/workData';
import { WorkQService } from '@app/_services/workq.service';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { ToastService } from '@app/_services/toast.service';
import { FormBuilder } from '@angular/forms';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AdCodePopOver } from './adcodepopover'
import { OrderModalPage } from './ordermodal-page'
import { OrderService } from '@app/_services/order.service';

@Component({
    selector: 'app-packing',
    templateUrl: './packing.page.html',
    styleUrls: ['./packing.page.scss'],
})
export class PackingPage extends FormAms implements OnInit, OnDestroy {
    @ViewChild('putwall', { static: false }) putwallRef;
    @ViewChild('container', { static: true }) containerRef;
    @ViewChild('location', { static: true }) locationRef;
    @ViewChild('shipStaging', { static: false }) shipStagingRef;
    @ViewChild('quantity', { static: true }) quantityRef;
    @ViewChild('item', { static: false }) itemRef;

    workData: WorkData;
    showBtnHospital = false;
    showBtnRescan = false;
    workType = '21';
    failedCount = 0;
    shipLoc = 'PRESHIP-01';
    hospitalLoc = 'HOSP-PACK';
    done = false;
    itemsUpc = [];
    details = [];
    itemlgth: number;
    customerType = '';
    orderNumber;
    itemNumber;
    extra;
    showBtnPack = false;
    clientId = 0;
    message;


    constructor(
        private formBuilder: FormBuilder,
        private toastService: ToastService,
        private workQService: WorkQService,
        private router: Router,
        private lpService: LPService,
        private headerService: HeaderService,
        private popover: PopoverController,
        private modalController: ModalController,
        private orderService: OrderService,
        private alertController: AlertController
    ) {
        super();
        this.workData = new WorkData();
    }


    ngOnInit() {
        this.formGroup = this.formBuilder.group({
            container: '',
            location: '',
            putwall: '',
            shipStaging: '',
            quantity: '',
            item: ''
        });

        this.subscription = this.headerService.currentMessage.subscribe(header => {
            if (header === 'clear') {
                this.resetForm();
                if (this.workData.workQId != null) {
                    this.clearWork();
                }
            }
        });
    }

    


    ionViewWillEnter() {
        this.workQService.workUnassignwork(null);
        this.resetForm();
        this.setFocus('putwall');
        this.message = 'Scan <b>putwall</b>'
    }


    resetForm() {
        this.workData = new WorkData();
        this.setValueInput('putwall', '');
        this.setValueInput('container', '');
        this.setValueInput('quantity', '');
        this.setValueInput('location', '');
        this.containerRef.label = 'Container';
        this.message = 'Scan <b>putwall</b>'
        this.showBtnHospital = false;
        this.failedCount = 0;
        this.setFocus('putwall');
        this.customerType = '';
        this.done = false;
        this.itemsUpc = [];
        this.details = [];
        this.itemlgth = 0;
        this.showBtnPack = false;
        this.showBtnRescan = false;
        this.extra = 'match';
    }


    async presentModalDetail() {
        const modal = await this.modalController.create({
            component: OrderModalPage,
            componentProps: {
                data: {
                    details: this.details,
                    itemsUpc: this.itemsUpc
                }
            }
        });
        modal.onDidDismiss().then(
        )
        return await modal.present();
    }


    async presentAlertHospitalPack() {
        const alert = await this.alertController.create({
            header: 'Do you want to send to hospital?',
            cssClass: 'alertHeader',
            buttons: [
                {
                    text: 'yes',
                    handler: () => {
                        this.setFocus('container');
                        //this.showBtnHospital = false;                        
                        this.showBtnRescan = false;
                    }
                }, {
                    text: 'no',
                    handler: () => {
                        this.setFocus('item');
                    }
                }
            ]
        })
        await alert.present();
    }


    async presentAlertWork(data) {
        const alert = await this.alertController.create({
            header: 'You have a work assignment',
            buttons: [{
                text: 'Continue',
                handler: (blah) => {       
                    if(data.workType == "26"){
                        if (data.version == "v2"){
                          this.router.navigateByUrl('/mobile/picking/cart', { replaceUrl: true });
                        }else{
                          this.router.navigateByUrl('/mobile/picking/pick', { replaceUrl: true });
                        }
                      }  
                }
            }]
        });
        await alert.present();
    }


    resetFindWork() {
        this.workData = new WorkData();
        this.containerRef.label = 'Container';
        this.setValueInput('container', '');
        this.setValueInput('quantity', '');
        this.setValueInput('location', '');
        this.failedCount = 0;
        this.setFocus('location');
        this.done = false;
        this.findWork();
        this.itemsUpc = [];
        this.details = [];
        this.itemlgth = 0;
        this.showBtnPack = false;
        this.extra = 'match';
    }


    clearWork() {
        this.workQService.workUnassignwork(this.workData.workQId).then();
    }


    validatePutwall(e) {
        if (e.status === 'success') {
            this.findWork();
        } else {
            this.toastService.changeMessage({ color: 'danger', message: e.data });
        }
    }


    validateLocation(e) {
        if (e.status === 'success') {
            this.setFocus('item');
            this.message = 'Scan <b>items</b>';
            this.showBtnHospital = true;
        } else {
            this.toastService.changeMessage({ color: 'danger', message: 'Invalid Location' });
        }
    }


    validateQuantity(e) {
        if (e.status === 'success') {
            this.setFocus('container');
            this.message = 'Scan <b>container</b>';
            this.showBtnHospital = false;
        } else {
            this.toastService.changeMessage({ color: 'danger', message: 'Invalid Quantity' });
            this.failedCount++;
            if (this.failedCount >= 2) {
                this.showBtnHospital = true;
                this.setFocus('container');
            }
        }
    }


    isReadytoPack() {
        if (this.itemsUpc.length > 0) {
            this.extra = 'match';
            this.itemsUpc.forEach(ele => {
                var itm = this.details.find(upc => upc.displayItemNumber == ele)
                if (!itm) {
                    this.extra = 'noMatch';
                    return;
                }
                else if (itm.quantityOrdered == 0) {
                    this.extra = 'noMatch';
                    return;
                }
                else if (itm.quantityScanned > itm.quantityOrdered) {
                    this.extra = 'noMatch';
                    return;
                }
                console.log(this.extra);
            });
        }
    }


    validateItem(e) {
        this.setValueInput('item', '');
        if (e.status === 'success') {
            this.itemsUpc.push(e.data.displayItemNumber);
            var a = this.details.find(item => item.displayItemNumber == e.data.displayItemNumber)            
            if (!a) {
                this.details.push({
                    displayItemNumber: e.data.displayItemNumber,
                    orderNumber: "",
                    quantityOrdered: 0,
                    quantityScanned: 1
                });
            } else {
                a.quantityScanned = a.quantityScanned + 1;
                if (this.arrayEquals(this.workData.items, this.itemsUpc)) {
                    this.showBtnPack = true;
                    this.showBtnHospital = false;
                }
                else {
                    this.showBtnPack = false;
                }
            }
            this.itemNumber = e.data.displayItemNumber;
            this.isReadytoPack();
            this.toastService.changeMessage({ color: 'success', message: 'Item Scanned' });
            this.showBtnRescan = true;
            this.setFocus('item');
        } else {
            this.toastService.changeMessage({ color: 'danger', message: e.data });
        }
    }


    rescan(){
        this.details = [];        
        this.itemsUpc = [];
        this.showBtnRescan = false;        
        this.showBtnPack = false;
        this.orderDetail();
        this.extra = 'match';
        this.setFocus('item');
    }


    validateContainer(e) {
        console.log(e);
        if (e.status === 'success') {
            this.lpService.getPickContainer(e.data).then((results) => {
                if (results.code === 'container_not_found') {//success                    
                    if (!this.showBtnHospital) {
                        this.workData.destinationLP = this.containerRef.input.value;
                        this.workData.destinationLocation = this.shipLoc;
                        this.workData.action = "packed"
                        this.workComplete();
                    } else {
                        this.showBtnHospital = false;
                        this.done = true;
                        this.workData.destinationLP = this.containerRef.input.value;
                        this.workData.destinationLocation = this.hospitalLoc;
                        this.containerRef.disable = true
                        this.workData.action = "hosp pack";
                        this.workComplete();
                    }
                    console.log(results);
                } else {
                    if (results.code === 'success') { //failure                        
                        this.toastService.changeMessage({ color: 'danger', message: 'Duplicate LP' });
                        this.setValueInput('container', '');
                        this.setFocus('container');
                    }
                }
            });
        }
        else {
            this.toastService.changeMessage({ color: 'danger', message: e.data })
            this.setValueInput('container', '');
        }
    }


    clickPack() {
        if (this.arrayEquals(this.workData.items, this.itemsUpc)) {
            this.setFocus('container');
            this.message = 'Scan <b>container</b>';
            this.showBtnHospital = false;
            this.showBtnPack = false;
            this.showBtnRescan = false;
        } else {
            this.toastService.changeMessage({ color: 'danger', message: 'Items scanned dont match' });
            this.failedCount++;
            if (this.failedCount >= 2) {
                this.showBtnHospital = true;
                this.showBtnPack = false;
                this.setFocus('container');
            } else {
                this.setFocus('item');
                this.itemsUpc = [];
            }
        }
    }


    workComplete() {
        this.workData.customerType =  this.customerType;
        this.workQService.workComplete(this.workData).subscribe(
            (result) => {
                if (result.code === 'success') {
                    this.toastService.changeMessage({ color: 'success', message: 'Pack success' });
                    this.resetFindWork();
                    this.showBtnHospital = false;
                } else {
                    this.toastService.changeMessage({ color: 'danger', message: result.message });
                    this.setValueInput('container', '');
                    this.setFocus('container');
                }
            });
    }


    createPopover() {
        this.popover.create({
            component: AdCodePopOver,
            showBackdrop: false
        }).then((popoverElement) => {
            popoverElement.present();
        })
    }

    
    findWork() {
        this.workQService.getWorkPistola({
            workType: this.workType,
            zone: this.putwallRef.zone.value
        }).then(
            (result) => {
                console.log(result);
                if (result.code === 'success') {
                    this.clientId =  result.data.clientId;
                    console.log(this.clientId);
                    this.workData = result.data;                   
                    this.message = 'Scan location <b> ' + this.workData.sourceLocation + '</b>';
                    this.orderNumber = result.data.orderNumber;
                    this.orderDetail();
                    this.setFocus('location');
                    this.details = [];
                    console.log(result.data.orderNumber);
                } else if (result.code === 'no_work') {
                    this.toastService.changeMessage({ color: 'danger', message: 'No work available' });
                    this.resetForm();
                } else if (result.code === 'work_assigned' && result.data.workType !== this.workType) {
                    this.presentAlertWork(result.data);
                    return;
                }
            });
    }
    // findWork() {
    //     this.workQService.getWorkPistola({
    //         workType: this.workType,
    //         zone: this.putwallRef.zone.value
    //     }).then(
    //         (data) => {
    //             if (data.code === 'success') {
    //                 this.clientId =  data.data.clientId;
    //                 this.workData = data.data;
    //                 if (parseInt(this.workData.priority) < this.priorityLimit) {
    //                     this.showQty = false;
    //                 }
    //         (result) => {
    //             console.log(result);
    //             if (result.code === 'success') {
    //                 this.clientId =  result.data.clientId;
    //                 console.log(this.clientId);
    //                 this.workData = result.data;                   
    //                 this.message = 'Scan location <b> ' + this.workData.sourceLocation + '</b>';
    //                 this.orderNumber = result.data.orderNumber;
    //                 this.orderDetail();
    //                 this.setFocus('location');
    //                 this.details = [];
    //                 console.log(result.data.orderNumber);
    //             } else if (result.code === 'no_work') {
    //                 this.toastService.changeMessage({ color: 'danger', message: 'No work available' });
    //                 this.resetForm();
    //             } else if (result.code === 'work_assigned' && result.data.workType !== this.workType) {
    //                 this.presentAlertWork(result.data);
    //                 return;
    //             }
    //         });
    // }


    orderDetail() {
        this.details = [] ;
        this.orderService.orderDetail(this.orderNumber).then(
            (result) => {
                this.customerType = result.amCustomerType;
                for (let i = 0; i < result.lines2.length; i++) {
                    if (result.lines2[i].quantityOrdered - result.lines2[i].quantityCancelled > 0) {
                        this.details.push({
                            displayItemNumber: result.lines2[i].displayItemNumber,
                            orderNumber: result.lines2[i].orderNumber,
                            quantityOrdered: result.lines2[i].quantityOrdered - result.lines2[i].quantityCancelled,
                            quantityScanned: 0
                        });
                    }
                }
                this.itemlgth = result.lines2.length;
            }
        );
    }
    

    arrayEquals(a, b) {
        a.sort();
        b.sort();
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
    }


    setFocus(field: string) {
        let reference;
        switch (field) {
            case 'putwall': {
                reference = this.putwallRef;
                break;
            }
            case 'container': {
                reference = this.containerRef;
                this.containerRef.label = 'Container' + ((this.customerType != 'Elite Auto')?'':('('+this.customerType+')'));
                break;
            }
            case 'location': {
                reference = this.locationRef;
                break;
            }
            case 'quantity': {
                reference = this.quantityRef;
                break;
            }
            case 'item': {
                reference = this.itemRef;
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
