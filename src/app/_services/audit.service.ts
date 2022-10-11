import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';



@Injectable({ providedIn: 'root' })
export class AuditService {
    private API_URL = environment.API_URL;

    constructor(private http: HttpClient) {
    }

    submitAudit(auditInoput) {
        return this.http.post<any>(this.API_URL + '/inventory/audit', auditInoput);
    }
}
