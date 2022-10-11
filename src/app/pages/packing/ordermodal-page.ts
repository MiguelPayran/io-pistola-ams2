import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  templateUrl: './ordermodal-page.html',
  selector: 'ordermodal-page.ts',
  styleUrls: ['./ordermodal-page.scss'],
})
export class OrderModalPage implements OnInit {

  @Input() data: any;

  constructor(
    private modalController: ModalController) {
  }
  

  ngOnInit() {
    console.log(this.data);
  }


  dismiss(data?) {
    this.modalController.dismiss(data);
  }

}
