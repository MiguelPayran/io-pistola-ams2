import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingService } from '@app/_services/loading.service';
import { ToastService } from '@app/_services/toast.service';
import { AuthenticationService } from '@app/_services/authentication.service';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage implements OnInit {
  @ViewChild('username', { static: true }) usernameRef;
  @ViewChild('password', { static: true }) passwordRef;

  returnUrl: string;
  messageError: string;
  loading: any;
  loginForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private authService: AuthenticationService
  ) {
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: [''],
      password: ['']
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/mobile/landing';
  }


  ionViewWillEnter() {
    this.messageError = '';
    this.loginForm.reset();
  }


  async login() {
    
    setTimeout(() => {
      this.loadingService.loadingPresent();    
    this.authService.login({username:this.loginForm.getRawValue().username, password:this.loginForm.getRawValue().password}).subscribe(
      async (result) => {      
        this.loadingService.loadingDismiss();
        this.router.navigateByUrl('/mobile/picking/pick', { replaceUrl: true });
      },
      async (error) => {
        this.loadingService.loadingDismiss();
        this.toastService.changeMessage({color: 'danger', message: 'Username or password is incorrect'});        
        this.validateUsername();
      }
    );  }, 900);
  }
  

  validateUsername(): void {
    /*this.loginForm.get('password').setValue('');
    setTimeout(() => this.passwordRef.setFocus() , 300);    */
    this.passwordRef.setFocus();
  }

}
