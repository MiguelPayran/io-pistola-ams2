import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class TranslatorService {

  private messageSource = new BehaviorSubject('en');
  currentMessage = this.messageSource.asObservable();


  constructor(private translateService: TranslateService) {
    this.currentMessage.subscribe(message =>
      this.translateService.use(message)
    );
  }
  

  changeMessage(message) {
    this.messageSource.next(message);
  }
}