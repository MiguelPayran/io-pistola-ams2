import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class HeaderService {

  private messageSource = new BehaviorSubject('');
  currentMessage = this.messageSource.asObservable();

  
  private titleSource = new BehaviorSubject('');
  currentTitle = this.titleSource.asObservable();

  constructor() { }

  changeMessage(message: any) {
    this.messageSource.next(message);
  }

  changeTitle(title: any) {
    this.titleSource.next(title);
  }
}
