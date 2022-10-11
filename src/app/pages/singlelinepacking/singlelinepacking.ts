import { FormAms } from '@app/_general/form-ams';
import { PopoverController } from '@ionic/angular';
import { LPService } from '@app/_services/lp.service';
import { WorkData } from '@app/_models/workData';
import { HeaderService } from '@app/_services/header.service';
import { WorkQService } from '@app/_services/workq.service';
import { ToastService } from '@app/_services/toast.service';
import { FormBuilder } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { LocationService } from '@app/_services/location.service';
import { AdCodePopOver } from '../packing/adcodepopover';

@Component({
    selector: 'app-singlelinepacking',
    templateUrl: './singlelinepacking.html',
    styleUrls: ['./singlelinepacking.scss'],
})
export class SingleLinePackingPage extends FormAms implements OnInit {
    @ViewChild('location', { static: true }) locationRef;
    @ViewChild('tote', { static: true }) toteRef;
    @ViewChild('item', { static: true }) itemRef;
    @ViewChild('container', { static: true }) containerRef;

    workData: WorkData;
    shipLoc = 'PRESHIP-01';
    workType = '21';
    labelContainer = 'Tote';
    quantity = 0;
    itemNumber;
    clientId = 0;


    constructor(
        private formBuilder: FormBuilder,
        private toastService: ToastService,
        private workQService: WorkQService,
        private lpService: LPService,
        private popover: PopoverController,
        private headerService: HeaderService,
        private locationService: LocationService
    ) {
        super();
        this.workData = new WorkData();
    }


    ngOnInit() {
        this.formGroup = this.formBuilder.group({
            location: '',
            tote: '',
            item: '',
            container: ''
        });
        this.headerService.currentMessage.subscribe(header => {
            if (header === 'clear') {
                this.resetForm();
            }
        });
    }


    ionViewWillEnter() {
        this.workQService.workUnassignwork(null);
        this.resetForm();
    }
    

    resetForm() {
        this.workData = new WorkData();
        this.formGroup.reset();
        this.labelContainer = 'Tote';
        this.setFocus('location');
    }


    validateLocation(e) {
        if (e.status === 'success') {
            this.locationService.getInventoryByLocation(e.data.locationId, null).then(
                (result) => {
                    if (result.data.length === 0) {
                        this.toastService.changeMessage({ color: 'danger', message: 'Location is empty', duration: 5000 });
                        this.setValueInput('location', '');
                        this.setFocus('location');
                    } else {
                        this.setFocus('tote');
                    }
                });
        } else {
            this.toastService.changeMessage({ color: 'danger', message: e.data });
        }
    }


    validateTote(e) {
        if (e.status === 'success') {
            this.clientId = e.clientId;
            this.updateContainerQty();
            this.setFocus('item');
        } else {
            this.toastService.changeMessage({ color: 'danger', message: e.data });
        }
    }


    validateItem(e) {

        if (e.status === 'success') {
            this.itemNumber = e.data.itemNumber;
            this.findWork();
        } else {
            this.toastService.changeMessage({ color: 'danger', message: e.data });
        }
    }

    
    validateContainer(e) {   
        console.log('aaa');
        if (e.status === 'success') {
            this.lpService.getPickContainer(e.data).then((results) => {
                if (results.code === 'container_not_found') {//success    
                        this.workData.destinationLP = this.containerRef.input.value;
                        this.workData.destinationLocation = this.shipLoc;
                        this.workData.action = "packed";                        
                        this.workComplete();
                } else {
                    if (results.code === 'success') { //failure                        
                        this.toastService.changeMessage({ color: 'danger', message: 'Duplicate LP' });
                        this.setValueInput('container','');
                        this.setFocus('container');
                    }
                }
            });
        } else {           
			this.toastService.changeMessage({color: 'danger',message: e.data})
            this.setValueInput('container','');
            this.setFocus('container');
		}		
    }


    findWork() {
        this.workQService.getWorkPistola( {
                workType: this.workType,
                waveType: "S",
                locationId: this.getValueInput('location'),
                lp: this.getValueInput('tote'),
                itemNumber: this.itemNumber
            }
        ).then(
            (result) => {                
                console.log(result);
                console.log(result);
//                this.clientId =  result.data.clientId;
                if (result.code === 'work_assigned' && result.data.workType !== this.workType) {
                    return;
                }

                if (result.code === 'success') {
                    this.workData = result.data;
                    this.setFocus('container');
                } else if (result.code === 'no_work') {
                    this.toastService.changeMessage({ color: 'danger', message: 'No work available' });
                    this.setValueInput('item','');
                    this.setFocus('item');
                }
            },
            (error) => console.log(error)
        );
    }


    createPopover() {
        this.popover.create({
            component: AdCodePopOver,
            showBackdrop: false
        }).then((popoverElement) => {
            popoverElement.present();
        })
    }
    

    workComplete() {
        this.workQService.workComplete(this.workData).subscribe(
            (result) => {
                if (result.code === 'success') {
                    this.toastService.changeMessage({ color: 'success', message: 'Pack success' });
                    this.setValueInput('container','');
                    this.setValueInput('item','');
                    this.updateContainerQty();
                } else {
                    this.toastService.changeMessage({ color: 'danger', message: result.message });
                    if(result.code === 'invalid_container'){
                        this.setValueInput('container','');
                        this.setFocus('container');
                    }
                    
                }
            });
    }


    updateContainerQty(){
        this.lpService.getItemsByLocationOrLP(this.getValueInput('location'), this.getValueInput('tote')).then(
          result => {
            var qty = 0;
            result.data.forEach(element => {
              qty = qty + element.actualQty;
            });
            this.quantity = qty;
            this.labelContainer = 'Tote ('+ qty+' items)';
            if(this.quantity == 0){
                this.resetForm();
            }else{
                this.setFocus('item');
            }
          }
        );
      }


    setFocus(field: string) {
        let reference;
        switch (field) {
            case 'location': {
                this.message = "Scan <b>location<b/>";
                reference = this.locationRef;
                break;
            }
            case 'tote': {
                this.message = "Scan <b>tote<b/>";
                reference = this.toteRef;
                break;
            }
            case 'item': {
                this.message = "Scan <b>item<b/>";
                reference = this.itemRef;
                break;
            }
            case 'container': {
                this.message = "Scan <b>container<b/>";
                reference = this.containerRef
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
