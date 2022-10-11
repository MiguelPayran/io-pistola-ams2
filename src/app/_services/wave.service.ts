import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';

@Injectable({ providedIn: 'root' })
export class WaveService {
    private API_URL = environment.API_URL;

    constructor(
        private _httpClient: HttpClient
    ) {
    }
    

    getWavePicks(wave: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.API_URL + '/waves/picks/' + wave)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }    
    

    getTotesWaveMO(wave:string) {     
        return new Promise<any>((resolve, reject) => {
            this._httpClient.get(this.API_URL + '/wavesmo/'+wave+'/totes')
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}
