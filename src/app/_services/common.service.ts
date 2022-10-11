import { Adjust } from '@app/_models/adjust';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';

@Injectable()
export class CommonService {
    
    private API_URL = environment.API_URL;

    constructor( private httpClient: HttpClient ) {
    }


    getItemsInFork(forkId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.get(this.API_URL + '/inventory?location=' + forkId)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    
    getWarehouseControl(controlType: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.get(this.API_URL + '/warehousevalues?controlType=' + controlType)
                .toPromise()
                .then((response: any) => {
                    resolve(response.find(x => x !== undefined));
                }, reject);
        });
    }


    moveItem(moveItem: Adjust): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.API_URL + '/inventory/move', moveItem )
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    saveInventory(item: any): Promise<any> {       
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.API_URL + '/inventory/adjust', item )
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    saveInventoryBlock(adjust: any): Promise<any> {       
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.API_URL + '/inventory/adjust/block', adjust )
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    getReverseLocation(data: any): Promise<any> {       
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.API_URL + '/reversesort', data )
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }    

    
    getReverseLP(lp: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.get(this.API_URL + '/reversesort/detail/' + lp)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }    


    getContainerValidation(container: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.get(this.API_URL + '/container/' + container)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}



