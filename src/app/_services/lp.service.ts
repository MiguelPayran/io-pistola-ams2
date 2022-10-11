import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Adjust } from '@app/_models/adjust';
import { environment } from '@environment/environment';

@Injectable({ providedIn: 'root' })
export class LPService {
    private API_URL = environment.API_URL;

    constructor(private _httpClient: HttpClient) {
    }

    getLP(lp: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.API_URL + '/lps?lp=' + lp)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    getPickContainer(lp: string): Promise<any> {
        return new Promise((resolve, reject) => {    
            this._httpClient.get(this.API_URL + '/pickcontainer/' + lp)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    getLPsByLocation(location: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.API_URL + '/lps?location=' + location)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    moveLP(moveLP: Adjust): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(this.API_URL + '/inventory/movelp', moveLP )
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
    
    moveItem(moveItem: Adjust): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(this.API_URL + '/inventory/move', moveItem )
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    getItemsByLocationOrLP(location: string , lp: string, displayItemNumber = null ): Promise<any> {
        return new Promise((resolve, reject) => {
        
            this._httpClient.get(this.API_URL + '/inventory?'
            + ((location === null) ? '' : 'location=' + location)
            + ((lp === null) ? '' : '&lp=' + lp)
            + ((displayItemNumber === null) ? '' : '&displayItemNumber=' + displayItemNumber))
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


}
