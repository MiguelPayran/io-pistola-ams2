import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';


@Injectable({ providedIn: 'root' })
export class InventoryService {
    private API_URL = environment.API_URL;

    constructor(private _httpClient: HttpClient) {
    }

    getItem(clientId: number, displayItemNumber: string, detail: boolean = false): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.API_URL + '/clients/' + clientId + '/items?displayItemNumber=' + displayItemNumber + (!detail ? ('&&detail=false') : ''))
                .toPromise()
                .then((response: any) => {
                    resolve(response.find(x => x !== undefined));
                }, reject);
        });
    }


    getItemDestLocation(item: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.API_URL + '/returns/palprefix2/' + item)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
    getbbDestLocation(item: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.API_URL + '/bbwall/palprefix2/' + item)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    getInventoryData(currentPage, filterP, sortP, allP = false): Promise<any> {
        let limit = 8;
        let offset = currentPage;
        const body = {
            pageSize: limit,
            pageNumber: offset,
            sorts: sortP,
            filters: filterP,
            all: allP
        }
        return new Promise((resolve, reject) => {
            this._httpClient.post(this.API_URL + '/v2/inventory', body)
                .toPromise()
                .then((response: any) => {
                    resolve({response, body});
                }, reject);
        });
    }

}
