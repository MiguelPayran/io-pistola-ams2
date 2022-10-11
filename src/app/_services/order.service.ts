import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
     private API_URL = environment.API_URL;

     constructor(private httpClient: HttpClient) {
     }

     orderDetail(orderNumber): Promise<any> {
          return new Promise((resolve, reject) => {
               this.httpClient.get(this.API_URL + '/v2/orders/' + orderNumber)
                    .toPromise()
                    .then((response: any) => {
                         resolve(response);
                    }, reject);
          });
     }
}