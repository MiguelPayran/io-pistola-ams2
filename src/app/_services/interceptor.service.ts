
import { HttpInterceptor, HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SpinnerService } from './progress.service';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class InterceptorServiceService implements HttpInterceptor {
    constructor(
        private spinnerService: SpinnerService,
        private router: Router,
        private authenticationService: AuthenticationService
    ) { }


    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let token = '';
        if (!request.url.startsWith('./assets/i18n/')) {
            const user = this.authenticationService.currentUserValue;
            token = user === null ? '' : user.token;
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ` + token
                }
            });
        }


        this.spinnerService.changeMessage(true);
        
        return next.handle(request).pipe(
            tap(
                event => {
                    if (event instanceof HttpResponse) {
                        this.spinnerService.changeMessage(false);
                    }
                },
                error => {
                    if (error instanceof HttpErrorResponse) {
                        const helper = new JwtHelperService();
                        if (helper.isTokenExpired(token) || error.status === 401) {
                            this.router.navigate(['/mobile/login'], { queryParams: { returnUrl: this.router.url } });
                        }
                        console.log(error);
                        this.spinnerService.changeMessage(false);
                    }
                }
            )
        );
    }
}
