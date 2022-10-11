import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';

@Injectable({ providedIn: 'root' })
export class LocationService {
    private API_URL = environment.API_URL;

    constructor(private _httpClient: HttpClient) {
    }

    getLocations(location: string, pickArea: string, type: string = null): Promise<any> {
        let path = (pickArea == null ? location : location  + '/' + pickArea);
        if (type != null) {
           path = path + '?type=' + type;
       }
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.API_URL + '/locations/' + path)
                .toPromise()
                .then((response: any) =>     {
                    resolve(response.find(x => x !== undefined));
                }, reject);
        });
    }


    getInventoryByLocation( location: string,hu: string): Promise<any> {
        let url = '/inventory?location=' + location
        if (hu != null){
            url = url + '&lp=' + hu 
        }
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.API_URL + url)
            .toPromise()
            .then((response: any) =>{
              resolve(response);
            }, reject);      
        });
    }
}

