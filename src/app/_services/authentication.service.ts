import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { User } from 'app/_models';
import { environment } from '@environment/environment';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    
    isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
    currentUser: BehaviorSubject<User> = new BehaviorSubject<User>(null);
    userData = '';
    private API_URL = environment.API_URL;

    constructor(private http: HttpClient, private storage: Storage) {
        this.loadDataSession();
    }

    async loadDataSession(){
      this.storage.create();
        console.log('loadToken');
        const userData = await this.storage.get('currentUser');    
        if (userData != null) {
            this.userData = userData.value;
            this.currentUser.next(JSON.parse(userData));
            this.isAuthenticated.next(true);
        } else {
            this.currentUser.next(null);
            this.isAuthenticated.next(false);
        }
    }
    

    public get currentUserValue(): User {
        return this.currentUser.value;
    }


    login(credentials: {username, password}): Observable<any> {
        return this.http.post(this.API_URL + `/login`, credentials).pipe(
          map((data: any) => data),
          switchMap(token => {
            return from(this.storage.set('currentUser',JSON.stringify(token)));
          }),
          tap(_ => {
            this.currentUser.next(JSON.parse(_));
                this.isAuthenticated.next(true);
          })
        )
      }


    logout(): Promise<void> {
        this.currentUser.next(null);
        this.isAuthenticated.next(false);
        return this.storage.remove('currentUser');
      }

}
