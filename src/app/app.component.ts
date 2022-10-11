import { WorkQService } from '@app/_services/workq.service';
import { TranslatorService } from './_services/translator.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from './_services/authentication.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Platform, ToastController } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { ToastService } from './_services/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  appPages = [
    {
      title: 'Tote Verification',
      url: 'mobile/toteveri',
      icon: 'git-branch'
    },
    {
      title: 'Receiving ASN',
      url: 'mobile/receiving',
      icon: 'archive'
    },
    {
      title: 'Receiving',
      url: 'mobile/oldreceiving',
      icon: 'archive'
    },
    {
      title: 'Move',
      url: 'mobile/move',
      icon: 'git-compare'
    }
    ,
    {
      title: 'Audit',
      url: 'mobile/audit',
      icon: 'checkmark'
    },
    {
      title: 'Cycle Count',
      url: 'mobile/cyclecount',
      icon: 'refresh-circle'
    },
    {
      title: 'PPS',
      icon: 'bandage',
      open: false,
      subPages: [
        {
          title: 'Picking',
          url: 'mobile/picking/pick',
          icon: 'scan-circle'
        },
        {
          title: 'Cart Picking',
          url: 'mobile/picking/cart',
          icon: 'albums'
        },
        {
          title: 'Sortout',
          url: 'mobile/sortout',
          icon: 'funnel'
        },
        {
          title: 'Packing',
          url: 'mobile/packing',
          icon: 'file-tray-stacked'
        }
        ,
        {
          title: 'SL Packing',
          url: 'mobile/singlelinepacking',
          icon: 'git-commit'
        }
        ,
        {
          title: 'Hospital Packing',
          url: 'mobile/hospitalpacking',
          icon: 'cart'
        }
        ,
        {
          title: 'Move To Hospital',
          url: 'mobile/movetohospital',
          icon: 'bandage'
        }
      ]
    },
    {
      title: 'Zone Sort',
      url: 'mobile/zonesort',
      icon: 'expand'
    },
    {
      title: 'BB Sort',
      url: 'mobile/bbsort',
      icon: 'repeat'
    },
    {
      title: 'PPS MO',
      icon: 'bandage',
      open: false,
      subPages: [        
        {
          title: 'Picking MO',
          url: 'mobile/picking/pickmo',
          icon: 'albums'
        },
        {
          title: 'Sortout MO',
          url: 'mobile/sortoutmo',
          icon: 'funnel'
        },
      ]
    }
  ];

  username: string;
  loggedIn = false;
  amsTheme = true; // for style
  pageTitle = '';
  loadedComponent: any;
  languague = 'en';

  constructor(
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private swUpdate: SwUpdate,
    private toastCtrl: ToastController,
    private authService: AuthenticationService,
    private workQService: WorkQService,
    private toastService: ToastService,
    private translatorService: TranslatorService
  ) {
    this.initializeApp();
    this.translatorService.changeMessage(this.languague);
  }

  ngOnInit() {
    this.authService.isAuthenticated.subscribe(value => {
      this.loggedIn = value;
      this.username = this.loggedIn ? this.authService.currentUserValue.userDetails.id : '';
    });

    console.log('ngOnInitAppComponent');
    this.toastService.currentMessage.subscribe(toast => {
      this.presentToast(toast.color, toast.message, toast.duration);
    });

    this.swUpdate.available.subscribe(async res => {
      const toast = await this.toastCtrl.create({
        message: 'Update available!',
        position: 'top',
        buttons: [
          {
            role: 'cancel',
            text: 'Reload'
          }
        ]
      });

      await toast.present();

      toast
        .onDidDismiss()
        .then(() => this.swUpdate.activateUpdate())
        .then(() => window.location.reload());
    });
  }


  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.statusBar.hide();
    });
  }


  changeLanguage() {
    this.translatorService.changeMessage(this.languague);
  }


  openTutorial() {
    /*this.menu.enable(false);
    this.router.navigateByUrl('/tutorial');*/
  }


  async logout() {
    this.workQService.workUnassignwork(null);
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }


  refresh(method) {
    this.loadedComponent[method]();
  }


  async presentToast(color: string, message: string, toastDuration: number = 2000) {
    const toastMessage = message;
    const toastColor = color;
    if (toastMessage !== null) {
      const toast = await this.toastCtrl.create({
        message: toastMessage,
        duration: toastDuration,
        color: toastColor,
        position: 'top'
      });
      toast.present();
    }
  }

}
