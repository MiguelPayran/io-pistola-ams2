import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  templateUrl: './modal-page.html',
  selector: 'modal-page',
  styleUrls: ['./modal-page.scss'],
})
export class ModalPage implements OnInit {
  @Input() data: any;

  constructor(
    private modalController: ModalController) {
  }


  ngOnInit() {
    console.log(this.data);
  }


  dismiss(data?) {
    this.modalController.dismiss();
  }


  adjust(displayItemNumber) {
    console.log(displayItemNumber);
    this.modalController.dismiss(displayItemNumber);
  }

}
