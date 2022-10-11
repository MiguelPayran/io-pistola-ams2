import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  templateUrl: './modaldetail-page.html',
  selector: 'modaldetail-page',
  styleUrls: ['./modaldetail-page.scss'],
})
export class ModalDetailPage implements OnInit {

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
