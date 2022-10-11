import { Component, OnInit } from "@angular/core";
import { PopoverController } from "@ionic/angular";

@Component({
    selector: 'pistola-insert',
    templateUrl: './adcodepopover.html',
    styleUrls: ['./adcodepopover.scss'],
})
export class AdCodePopOver implements OnInit {
    
  constructor(private popover:PopoverController) {} 
    
  ngOnInit() {}

  closePopover() {
    this.popover.dismiss();
  }
}