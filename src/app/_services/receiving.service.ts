import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';

@Injectable()
export class ReceivingService  {

    private API_URL = environment.API_URL;

    constructor(
        private httpClient: HttpClient
    ) {
    }


    getCartonIdInformation(clientId : number, cartonId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            
            this.httpClient.get(this.API_URL + '/receiving/clients/' + clientId + '/cartons/' + cartonId)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    getPONumber(poNumber: string, clientId: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.get(this.API_URL + '/receiving/clientid/' + clientId + '/ponumber/' + poNumber)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    saveReceipt(receipt: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.API_URL + '/receiving/receipt', receipt)
                .toPromise()
                .then((response: any) => {
                    console.log(response);
                    resolve(response);
                }, reject);
        });
    }


    getDestinationPal(itemId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.get(this.API_URL + '/receiving/destination/' + itemId)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

}






