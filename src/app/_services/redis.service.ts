import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';

@Injectable({ providedIn: 'root' })
export class RedisService {
    private API_URL = environment.API_URL;

    constructor(
        private httpClient: HttpClient
    ) {
    }
    

    getKey(key): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.get(this.API_URL + '/redis/'+key)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    setKey(key, value): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.API_URL + '/redis', { key , value })
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}