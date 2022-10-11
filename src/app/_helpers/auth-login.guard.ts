import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router, CanLoad } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';
import { AuthenticationService } from '@app/_services';

@Injectable({ providedIn: 'root' })
export class AutoLoginGuard implements CanLoad {

  constructor(private router: Router,
    private authService: AuthenticationService) {
  }

  canLoad(): Observable<boolean> {
    return this.authService.isAuthenticated.pipe(
      filter(val => val !== null), // Filter out initial Behaviour subject value
      take(1), // Otherwise the Observable doesn't complete!
      map(isAuthenticated => {
        console.log('Found previous token, automatic login');
        if (isAuthenticated) { // Directly open inside area                     
          this.router.navigateByUrl('/mobile/picking/pick', { replaceUrl: true });
        } else { // Simply allow access to the login
          return true;
        }
      })
    );
  }
}