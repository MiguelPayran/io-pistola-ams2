import { FormGroup } from '@angular/forms';
import { Component, ViewChild, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { FocusService } from '../../_services/focus.service';
import { IonInput, IonSelect } from '@ionic/angular';
import { ClientService } from '../../_services/client.service';

@Component({
  selector: 'pistola-client',
  templateUrl: 'client.html',
  styleUrls: ['./client.scss'],
})


export class ClientComponent implements OnInit {

  @ViewChild(IonSelect, { static: true }) clientRef;
  @Output() sendMessage: EventEmitter<any> = new EventEmitter();
  @Input() required = true;
  @Input() disable = false;
  @Input() myForm: FormGroup;
  @Input() nameControl = 'client';
  clients = [];
  input;
  selectedClient : any; 
  compareWith : any ;

  constructor(
    private focusService: FocusService, private clientService:ClientService) { }

    compareFn(o1 , o2): boolean {
      return o1 === o2;
    }
    

  ngOnInit() {
      setTimeout(() => {
     this.clientService.getClients().then(
        result => {
          this.clients = result;          
         // this.selectedClient = this.clients[0];
         //  this.compareWith = this.compareFn;        
        },        
        error => console.log(error)
      );  
    }, 999);
  }

  selectChange(e){   
    console.log('selectChange'); 
    if(e.target.value == null){
      this.selectedClient = null ;
      this.sendMessage.emit({ status: 'error', data: this.selectedClient})
    }else{
      this.selectedClient = this.clients.find( i => i.clientId == e.target.value);
      console.log(this.selectedClient);    ;
      this.sendMessage.emit({ status: 'success', data: this.selectedClient})

    }
  }
  
  setFocus() {
   this.clientRef.open();
     this.focusService.changeMessage({
       form: this.myForm,
       eleFocus: this.clientRef
     });
  }


  setDisable(band) {
    this.disable = band;
  }


  setDisabledAll() {
    this.focusService.changeMessage({
      form: this.myForm
    });
  }
}