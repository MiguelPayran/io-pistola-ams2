import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  constructor(
    public route: ActivatedRoute,
    public router : Router
  ) {
   
   }

  ngOnInit() {
  }

  receving(){
    this.router.navigateByUrl('/mobile/receiving');
    console.log('WORKED')
  }
  adjust(){
    this.router.navigateByUrl('/mobile/move');
  }
  audit(){
    this.router.navigateByUrl('/mobile/audit');
  }
  pps(){
    this.router.navigateByUrl('/mobile/picking/pick');
  }

}
