import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';

@Injectable({ providedIn: 'root' })
export class WorkQService {
    private API_URL = environment.API_URL;

    constructor(private httpClient: HttpClient) {
    }

    getWorkPistola(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.API_URL + '/workq/getwork',
                data)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    getPickWaves(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.API_URL + '/workq/pick/waves',
                data)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    workComplete(workData) {
        return this.httpClient.post<any>(this.API_URL + '/workq/workcomplete', workData);
    }


    createWork(data): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.API_URL + '/workq/creatework', data)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    closePickingContainer(data): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.API_URL + '/pick/closecontainer', data)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    getStagingSortArea(wave): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.get(this.API_URL + '/pick/stagingsortarea/' + wave)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
    

    workUnassignwork(workQId): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.API_URL + '/workq/unassignwork/' + (workQId==null?'':workQId), {})
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    hospitalPack(data): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.API_URL + '/hosp/pack', data)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    hostpitalLocation(location): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.get(this.API_URL + '/hosp/location/' + location)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    cycleCount(data): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.API_URL + '/workq/cc', data)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
    

    validateLPWave(data): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.API_URL + '/pick/lp', data)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}