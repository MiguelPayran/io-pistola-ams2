import { FormAms } from '@app/_general/form-ams';
import { HeaderService } from '@app/_services/header.service';
import { WorkQService } from '@app/_services/workq.service';
import { ToastService } from '@app/_services/toast.service';
import { FormBuilder } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-movetohospital',
    templateUrl: './movetohospital.html',
    styleUrls: ['./movetohospital.scss'],
})
export class MoveToHospitalPage extends FormAms implements OnInit {
    @ViewChild('putwall', { static: false }) putwallRef;
    @ViewChild('container', { static: true }) containerRef;
    @ViewChild('location', { static: true }) locationRef;

    hospitalLoc = 'HOSP-PACK'
    sourceLocation;
    customerType = '';
    destLP;


    constructor(
        private formBuilder: FormBuilder,
        private toastService: ToastService,
        private workQService: WorkQService,
        private headerService: HeaderService
    ) {  
        super();     
    }


    ionViewWillEnter() {        
        this.workQService.workUnassignwork(null);
        this.resetForm();
        this.setFocus('putwall');
        this.message = 'Scan <b>putwall</b>'
    }


    ngOnInit() {
        this.formGroup = this.formBuilder.group({            
            putwall: '',
            location: '',
            container: ''
        });
        this.headerService.currentMessage.subscribe(header => {
            if (header === 'clear') {
                this.resetForm();
              
            }
        });
    }


    resetForm() {
        this.setFocus('putwall');
        this.customerType = '';
        this.setValueInput('putwall','');
        this.setValueInput('location','');
        this.setValueInput('container','');
        this.message = 'Scan <b>putwall</b>';
    }


    validatePutwall(e) {
        if (e.status === 'success') {
            this.setFocus('location');
            this.message = 'Scan <b>location</b>';
        }
        else {
            this.toastService.changeMessage({ color: 'danger', message: e.data });
        }
    }


    validateLocation(e) {
        this.sourceLocation = e.data.description;
       console.log(e.status);
        if(e.status === 'failure'){
            this.setValueInput('location', '');
            this.toastService.changeMessage({ color: 'danger', message:e.data});
            console.log(e.data);
        }
        else{
            this.workQService.hostpitalLocation(this.sourceLocation).then(
                (result) => {
                    console.log(result);
                        this.setValueInput('container', '');
                        this.customerType =  result.customerType; 
                        this.setFocus('container');
                        this.message = 'Scan <b>container</b>';                       
                }, error => {
                    this.setValueInput('location', '');
                    this.toastService.changeMessage({ color: 'danger', message:'Location is empty'});
                    this.setFocus('location');

                });
        }       
    }


    validateContainer(e) {
        if (e.status === 'success') {
            this.disableAllFields();
            this.destLP = e.data;
            this.hospitalMove();
        }
    }


    hospitalMove() {
        this.workQService.hospitalPack({
            "sourceLocation": this.sourceLocation,
            "destinationLocation": this.hospitalLoc,
            "LP": this.destLP,
            "customerType": this.customerType,
            "action": 'hosp pack'
        }).then(
            (result) => {
                if(result.code === 'duplicate_container'){
                    this.setValueInput('container', '');
                    this.toastService.changeMessage({ color: 'danger', message:'Duplicate container.'});
                    this.setFocus('container');
                } else{
                    this.setValueInput('location','');
                    this.setValueInput('container','');
                    this.message = 'Scan <b>Location</b>';
                    this.toastService.changeMessage({ color: 'success', message:'Order Has been hospital packed.'});    
                    this.setFocus('location');                 
                }
            }, (error) => {
                this.toastService.changeMessage({ color: 'danger', message:error.error.message});  
                this.setValueInput('container','');
                this.setFocus('container');
            }
        )
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
                this.containerRef.label = 'Container' + (( this.customerType != 'Elite Auto')?'':('('+this.customerType+')'));
                break;
            }
            case 'location': {
                reference = this.locationRef;
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
