import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';

@Injectable({ providedIn: 'root' })
export class ZoneService {
    private API_URL = environment.API_URL;

    constructor ( private httpClient: HttpClient ) {
    }

    getZones(zone: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.get(this.API_URL + '/zones/' + zone)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}
