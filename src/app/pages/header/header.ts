import { Component, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router, ActivationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SpinnerService } from '@app/_services/progress.service';
import { HeaderService } from '@app/_services/header.service';
import { InventoryComponent } from '../inventory/inventory.component';

@Component({
  selector: 'pistola-header',
  templateUrl: './header.html'
})
export class HeaderComponent {

  @Output() refreshClicked: EventEmitter<any> = new EventEmitter();
  pageTitle = '';
  resetFunction = '';
  showHeader = false;
  spin = false;

  constructor(private spinnerService: SpinnerService,
    private router: Router,
    private headerService: HeaderService,
    private modalCtrl: ModalController
  ) {

    this.router.events.pipe(filter(event => event instanceof ActivationEnd))
      .subscribe(event => {
        this.pageTitle = event['snapshot'].data.pageTitle;
        this.showHeader = event['snapshot'].data.showHeader;
        this.resetFunction = event['snapshot'].data.resetFunction;
      });
    this.headerService.currentTitle.subscribe(title => {
      this.pageTitle = title;
    })
  }


  ngOnInit() {
    this.spinnerService.currentMessage.subscribe(spin => this.spin = spin);
  }


  emitEventToChild() {
    this.headerService.changeMessage('clear');
  }

  async openInventory() {
    const modal = await this.modalCtrl.create({
      component: InventoryComponent
    });
    modal.present();
  }

}
