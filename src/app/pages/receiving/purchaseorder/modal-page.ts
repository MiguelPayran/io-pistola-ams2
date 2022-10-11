import { ModalController, AlertController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  templateUrl: './modal-page.html',
  selector: 'modal-page',
  styleUrls: ['./modal-page.scss'],
})
export class ModalPage implements OnInit {

  @Input() data: any;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController) {
  }

  ngOnInit() {
    this.data.detail.forEach(item => {
      item.oldqty = item.quantity;
    });
  }

  dismiss(data?) {
    this.modalController.dismiss(data);
  }

  confirmQuantity() {
    let message = ``;

    this.data.detail.forEach(item => {
      if (item.oldqty !== item.quantity) {
        message = message + `
        <p><b>` + item.displayItemNumber + `: ` + item.oldqty + ` » ` + item.quantity + `</b></p>`;
      }
    });

    if (message === ``) {
      message = `<p> Do you want to confirm the quantity for this box?</p>`;
    } else {
      message = `<p> You changed the following items:</p>` + message;
    }

    this.presentAlertConfirm(message);
  }


  async presentAlertConfirm(message) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm Quantity',
      message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: 'Ok',
          handler: () => {
            this.dismiss(this.data);
          }
        }
      ]
    });

    await alert.present();
  }
}
