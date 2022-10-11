import { FormBuilder } from '@angular/forms';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PopoverController, ModalController, AlertController } from '@ionic/angular';
import { FormAms } from '@app/_general/form-ams';
import { WorkData } from '@app/_models/workData';
import { OrderService } from '@app/_services/order.service';
import { ToastService } from '@app/_services/toast.service';
import { WorkQService } from '@app/_services/workq.service';
import { HeaderService } from '@app/_services/header.service';
import { AdCodePopOver } from '@app/pages/packing/adcodepopover';
import { OrderModalPage } from '@app/pages/packing/ordermodal-page';

@Component({
    selector: 'app-hospitalpacking',
    templateUrl: './hospitalpacking.page.html',
    styleUrls: ['./hospitalpacking.page.scss'],
})
export class HospitalPackingPage extends FormAms implements OnInit, OnDestroy {
    @ViewChild('cart', { static: false }) cartRef;
    @ViewChild('container', { static: false }) containerRef;
    @ViewChild('location', { static: true }) locationRef;
    @ViewChild('shipStaging', { static: false }) shipStagingRef;
    @ViewChild('item', { static: false }) itemRef;

    workData: WorkData;
    showBtnHospital = false;
    showBtnPack = false;
    workType = '21';
    failedCount = 0;
    shipLoc = 'PRESHIP-01'
    hospitalLoc = 'HOSP-PACK';
    orderNumber;
    itemNumber;
    extra;
    done = false;
    items = [];
    itemsUpc = [];
    details = [];
    itemlgth: number;


    constructor(
        private formBuilder: FormBuilder,
        private modalController: ModalController,
        private popover: PopoverController,
        private alertController: AlertController,
        private headerService: HeaderService,
        private toastService: ToastService,
        private workQService: WorkQService,
        private orderService: OrderService
    ) {
        super();
        this.workData = new WorkData();
    }


    ngOnInit() {
        this.formGroup = this.formBuilder.group({
            container: '',
            location: '',
            cart: '',
            shipStaging: '',
            item: '',
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
        this.setFocus('cart');
        this.message = 'Scan <b>cart</b>'
    }


    resetForm() {
        this.workData = new WorkData();
        this.setValueInput('cart', '');
        this.setValueInput('container', '');
        this.setValueInput('item', '');
        this.setValueInput('location', '');
        this.message = 'Scan <b>cart</b>'
        this.showBtnHospital = false;
        this.failedCount = 0;
        this.setFocus('cart');
        this.done = false;
        this.itemsUpc = [];
        this.itemlgth = 0;
        this.showBtnPack = false;
        this.extra = 'match';
        this.items = [];
        this.details = [];
    }  


    async presentAlertHospitalPack() {
        const alert = await this.alertController.create({
            header: 'Do you want to sent to hospital?',
            cssClass: 'alertHeader',
            buttons: [{
                text: 'yes',
                handler: () => {
                    this.hospitalPacking();

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
    
    
    resetFindWork() {
        this.workData = new WorkData();
        this.setValueInput('container', '');
        this.setValueInput('item', '');
        this.setValueInput('location', '');
        this.failedCount = 0;
        this.setFocus('location');
        this.showBtnPack = false;
        this.items = [];
        this.itemsUpc = [];
        this.details = [];
        this.done = false;
        this.findWork();
    }


    clearWork() {
        this.workQService.workUnassignwork(this.workData.workQId).then();
    }


    validateCart(e) {
        if (e.status === 'success') {
            this.findWork();
        } else {
            this.toastService.changeMessage({ color: 'danger', message: e.data });
        }
    }


    validateLocation(e) {
        if (e.status === 'success') {
            this.setFocus('container');
            this.message = 'Scan container <b>' + this.workData.destinationLP + '</b>';
        } else {
            this.toastService.changeMessage({ color: 'danger', message: 'Invalid Location' });
        }
    }

    validateItem(e) {

        if (e.status === 'success') {
            this.itemsUpc.push(this.getValueInput('item'));
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
            this.setValueInput('item', '');
            this.setFocus('item');
            this.itemNumber = e.data.displayItemNumber;
            this.isReadytoPack();
            this.items.push(e.data.itemNumber);
        } else {
            this.toastService.changeMessage({ color: 'danger', message: e.data });
        }
    }

    clickPack() {
        this.workData.destinationLP = this.containerRef.input.value;
        this.workData.destinationLocation = this.shipLoc;
        this.workData.action = "packed"
        this.workComplete();
    }


    validateLP(e) {
        if (e.status === 'success') {
            this.message = 'Scan <b>items</b>';
            this.setFocus('item');;
            this.showBtnHospital = true;
            this.orderDetail();


        } else {
            this.toastService.changeMessage({ color: 'danger', message: "Container doesn't match" });
        }
    }



    hospitalPacking() {
        this.showBtnHospital = false;
        this.done = true;
        this.workData.destinationLP = this.containerRef.input.value;
        this.workData.destinationLocation = this.hospitalLoc;
        this.containerRef.disable = true
        this.workData.action = "hosp pack";
        this.workComplete();
    }

    workComplete() {
        this.workData.items = this.items;
        this.workData.waveType = "H";
        this.workData.sourceLocation = this.hospitalLoc;
        this.workQService.workComplete(this.workData).subscribe(
            (result) => {
                if (result.code === 'success') {
                    this.toastService.changeMessage({ color: 'success', message: 'Pack success' });
                    this.resetFindWork();
                } else {
                    this.showBtnPack = false;
                    this.toastService.changeMessage({ color: 'danger', message: result.message });
                    this.items = [];
                    this.itemsUpc = [];
                    this.failedCount++;
                    if (this.failedCount >= 2) {
                        this.showBtnHospital = true;
                        this.disableAllFields();
                    } else {
                        this.setFocus('item');
                    }
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
            zone: this.cartRef.input.value,
            waveType: 'H'
        }).then(
            (data) => {
                console.log(data);
                if (data.code === 'success') {
                    this.details = [];
                    this.workData = data.data;
                    this.orderNumber = data.data.orderNumber;
                    this.orderDetail();
                    this.message = 'Scan location <b> ' + this.workData.sourceLP + '</b>';
                    //this.locationRef.label = this.workData.sourceLP;
                    this.setFocus('location');
                } else if (data.code === 'no_work') {
                    this.toastService.changeMessage({ color: 'danger', message: 'No work available' });
                    this.resetForm();
                } else if (data.code === 'work_assigned' && data.data.workType == '21') {
                    //work assigned
                    this.workData = data.data;
                    this.toastService.changeMessage({ color: 'danger', message: 'Packing Working has already been assiged' });
                    this.cartRef.input.setValue(data.data.zone);
                    this.message = 'Scan location <b> ' + this.workData.sourceLP + '</b>';
                    this.setFocus('location');
                }
            });
    }

    isReadytoPack() {
        if (this.itemsUpc.length > 0) {
            this.extra = 'match';
            this.itemsUpc.forEach(ele => {
                var itm = this.details.find(upc => upc.displayItemNumber == ele)
                if (!itm) {
                    this.extra = 'noMatch';
                }
                else if (itm.quantityOrdered == 0) {
                    this.extra = 'noMatch';
                }
                else if (itm.quantityScanned > itm.quantityOrdered) {
                    this.extra = 'noMatch';
                }
                console.log(this.extra);
            });
        }
    }

    arrayEquals(a, b) {
        a.sort();
        b.sort();
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
    }



    orderDetail() {
        this.details = [];
        this.orderService.orderDetail(this.orderNumber).then(
            (result) => {
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

    setFocus(field: string) {
        let reference;
        switch (field) {
            case 'cart': {
                reference = this.cartRef;
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
            case 'item': {
                reference = this.itemRef;
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
