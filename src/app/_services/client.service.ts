import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Adjust } from '../_models/adjust';

@Injectable({ providedIn: 'root' })
export class ClientService {
    private API_URL = environment.API_URL;

    constructor(private _httpClient: HttpClient) {
    }

    getClients(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.API_URL + '/clients')
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


}
