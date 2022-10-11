import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HeaderService } from '@app/_services/header.service';



@Component({
  selector: 'app-move',
  templateUrl: './move.page.html',
  styleUrls: ['./move.page.scss'],
})
export class MovePage implements OnInit {
  @ViewChild('moveLP', { static: false }) lpMoveRef;
  @ViewChild('moveitem', { static: false }) moveItemRef;
  @ViewChild('adjustInc', { static: false }) adjustIncRef;
  @ViewChild('adjustDec', { static: false }) adjustDecRef;
 

  title: string = "MOVE";
  sign = 1;

  constructor(
    public headerService: HeaderService 
  ) { }

  fabClick(e) {
    switch (e) {
      case 'Decrement': {
        this.sign = -1;
        this.headerService.changeTitle('DECREMENT');
        setTimeout(() => this.adjustDecRef.resetForm(), 50);
        break;
      }
      case 'Increment': {
        this.sign = 1;
        this.headerService.changeTitle('INCREMENT');
        setTimeout(() => this.adjustIncRef.resetForm(), 50);
        break;
      }
      case 'Move': {
        this.headerService.changeTitle('MOVE');
        setTimeout(() => this.moveItemRef.resetForm(), 50);
        break;
      }
      case 'LP Move': {
        this.headerService.changeTitle('LP MOVE');
        setTimeout(() => this.lpMoveRef.resetForm(), 50);
        break;
      }
     }
     this.title = e;
  }
  

  ngOnInit() {
  }


  ionViewDidEnter(){    
    this.fabClick('Move');
  }


}
