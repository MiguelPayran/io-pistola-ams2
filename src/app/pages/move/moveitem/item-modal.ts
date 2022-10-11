import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { ToastService } from '@app/_services/toast.service';

@Component({
  templateUrl: './item-modal.html',
  selector: 'item-modal',
  styleUrls: ['./item-modal.scss'],
})
export class ItemModalPage implements OnInit {
  @Input() data: any;
  hasLotNumber = false;
  

  constructor(
    private modalController: ModalController,
    private toastService: ToastService    
    ) {
  }

  ngOnInit() {
    console.log(this.data);
    this.data.items.forEach(item => {
      if( item.lotNumber != null){
        this.hasLotNumber = true;
      }
    });     
  }


  async presentToast(message, color) {
    const toast = await this.toastService.changeMessage({
      header: message,
      color: color,
      duration: 3000
    });
  }

 
  resetForm() {
  }


  dismiss() {
    this.modalController.dismiss();
  }
}

