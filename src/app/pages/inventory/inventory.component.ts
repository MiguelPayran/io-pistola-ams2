import { Component, OnInit, OnChanges, SimpleChanges, ViewChildren } from '@angular/core';
import { InventoryService } from '@app/_services/inventory.service';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { IonInfiniteScroll } from '@ionic/angular';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnInit, OnChanges {
  @ViewChildren(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  totalPages = 0;
  currentPage = 0;
  isloading = false;
  inventoryData: any[] = [];
  filter: any[] = [];
  sorts = [
    {
      "property": "locationId",
      "direction": "ASC"
    }
  ];
  searchItems: any = {}
  constructor(
    private modalCtrl: ModalController,
    public alertController: AlertController,
    public _inventoryService: InventoryService
  ) { }

  ngOnInit() {
    this.presentAlertConfirm()
  }
  ngOnChanges(changes: SimpleChanges): void {

  }
  async loadData(event) {

    if (this.currentPage < this.totalPages) {
      this.isloading = true;
      await this.wait(500);
      event.target.complete();
      this.appendNewData();
    } else {
      event.target.disabled = true;
    }
  }

  async infoAlert() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'No Data Found',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            if (this.inventoryData.length === 0) {
              this.presentAlertConfirm();
            }
          },
        }
      ],
    })
    await alert.present();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Search Config',
      inputs: [
        {
          name: 'location',
          placeholder: 'Location'
        },
        {
          name: 'upc',
          placeholder: 'UPC',
          type: 'number'
        },
        {
          name: 'licensePlate',
          placeholder: 'LP',
          type: 'text',

        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            if (this.inventoryData.length === 0) {
              this.confirm()
            }
          },
        },
        {
          text: 'Accept',
          handler: (data) => {
            this.filter = data
            this.configSearch(this.filter);
          },
        },
      ],
    });

    await alert.present();
  }

  confirm() {
    return this.modalCtrl.dismiss();
  }

  configSearch(data) {
    this.isloading = true;
    this.filter = [];
    if (data.location !== "") {
      this.filter.push({
        "property": "LocationId",
        "symbol": "sw",
        "value": data.location.toString().toUpperCase()
      });
    }
    if (data.upc !== "") {
      this.filter.push({
        "property": "DisplayItemNumber",
        "symbol": "sw",
        "value": data.upc.toString().toUpperCase()
      });
    }
    if (data.licensePlate !== "") {
      this.filter.push({
        "property": "HuId",
        "symbol": "sw",
        "value": data.licensePlate.toString().toUpperCase()
      });
    }
    this._inventoryService.getInventoryData(1, this.filter, this.sorts)
      .then((response) => {
        console.log(response.response.data)
        this.inventoryData = response.response.data
        this.currentPage = response.response.pageIndex;
        this.totalPages = response.response.totalPages;
        this.isloading = false;
        this.searchItems = response.body
        if (this.inventoryData.length === 0) {
          this.infoAlert();
        }
      })
  }
  appendNewData() {
    const page = this.currentPage + 1;
    this._inventoryService.getInventoryData(page, this.searchItems.filters, this.searchItems.sorts)
      .then(response => {
        response.response.data.map(item => {
          this.inventoryData.push(item);
          this.currentPage = response.response.pageIndex;
          this.isloading = false;
        })
      })
  }
  wait(time): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
}