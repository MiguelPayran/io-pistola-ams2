import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  templateUrl: './modalmo-page.html',
  selector: 'modalmo-page',
  styleUrls: ['./modalmo-page.scss'],
})
export class ModalMOPage implements OnInit {

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
