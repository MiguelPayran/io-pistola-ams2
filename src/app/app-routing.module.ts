import { AutoLoginGuard } from './_helpers/auth-login.guard';
import { AuthGuard } from './_helpers/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckTutorial } from './providers/check-tutorial.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'mobile/login',
    pathMatch: 'full'
  },
  {
    path: 'mobile/login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule),
    data: {showHeader: false},
    canLoad: [AutoLoginGuard] 
  },
  {
    path: 'mobile/toteveri',
    loadChildren: () => import('./pages/toteveri/toteveri.module').then( m => m.ToteVeriPageModule),
    data: {pageTitle: 'Tote Verification', resetFunction: 'resetForm',  showHeader: true},
    canLoad: [AuthGuard] 
  },
  {
    path: 'mobile/tutorial',
    loadChildren: () => import('./pages/tutorial/tutorial.module').then(m => m.TutorialModule),
    canLoad: [CheckTutorial]
  },
  {
    path: 'mobile/receiving',
    loadChildren: () => import('./pages/receiving/purchaseorder/purchaseorder.module').then(m => m.PurchaseorderPageModule),
    data: {pageTitle: 'Receiving VSN', resetFunction: 'resetForm', showHeader: true},
    canLoad: [AuthGuard] 
  },
  {
    path: 'mobile/oldreceiving',
    loadChildren: () => import('./pages/oldreceiving/oldpurchaseorder/oldpurchaseorder.module').then(m => m.OldPurchaseOrderPageModule),
    data: {pageTitle: 'Receiving', resetFunction: 'resetForm', showHeader: true},
    canLoad: [AuthGuard] 
  },
  {
    path: 'mobile/audit',
    loadChildren: () => import('./pages/audit/audit.module').then( m => m.AuditModule),
    data: {pageTitle: 'Audit', resetFunction: 'resetForm',  showHeader: true},
    canLoad: [AuthGuard] 
  },
  {
    path: 'mobile/picking',
    loadChildren: () => import('./pages/picking/picking.module').then( m => m.PickingPageModule),
    data: {pageTitle: 'Picking', resetFunction: 'resetForm',  showHeader: true},
    canLoad: [AuthGuard] 
  },
  {
    path: 'mobile/move',
    loadChildren: () => import('./pages/move/move.module').then( m => m.MovePageModule),
    data: {pageTitle: 'Move', resetFunction: 'resetForm',  showHeader: true},
    canLoad: [AuthGuard] 
  },
  {
    path: 'mobile/cyclecount',
    loadChildren: () => import('./pages/cyclecount/cyclecount.module').then( m => m.CycleCountPageModule),
    data: {pageTitle: 'Cycle Count', resetFunction: 'resetForm',  showHeader: true},
    canLoad: [AuthGuard] 
  },
  {
    path: 'mobile/sortout',
    loadChildren: () => import('./pages/sortout/sortout.module').then( m => m.SortoutPageModule),
    data: {pageTitle: 'Sortout', resetFunction: 'resetForm',  showHeader: true},
    canLoad: [AuthGuard] 
  },
  {
    path: 'mobile/sortoutmo',
    loadChildren: () => import('./pages/sortoutmo/sortoutmo.module').then( m => m.SortoutMOPageModule),
    data: {pageTitle: 'Sortout MO', resetFunction: 'resetForm',  showHeader: true},
    canLoad: [AuthGuard] 
  },
  {
    path: 'mobile/packing',
    loadChildren: () => import('./pages/packing/packing.module').then( m => m.PackingPageModule),
    data: {pageTitle: 'Packing', resetFunction: 'resetForm',  showHeader: true},
    canLoad: [AuthGuard] 
  },
  {
    path: 'mobile/singlelinepacking',
    loadChildren: () => import('./pages/singlelinepacking/singlelinepacking.module').then( m => m.SingleLinePackingPageModule),
    data: {pageTitle: 'SingleLinePacking', resetFunction: 'resetForm',  showHeader: true},
    canLoad: [AuthGuard] 
  },
  {
    path: 'mobile/hospitalpacking',
    loadChildren: () => import('./pages/hospitalpacking/hospitalpacking.module').then( m => m.HospitalPackingPageModule),
    data: {pageTitle: 'HospitalPacking', resetFunction: 'resetForm',  showHeader: true},
    canLoad: [AuthGuard] 
  },
  {
    path: 'mobile/movetohospital',
    loadChildren: () => import('./pages/movetohospital/movetohospital.module').then( m => m.MoveToHospitalPageModule),
    data: {pageTitle: 'MoveToHospital', resetFunction: 'resetForm',  showHeader: true},
    canLoad: [AuthGuard] 
  },
  {
    path: 'mobile/zonesort',
    loadChildren: () => import('./pages/zonesort/zonesort.module').then( m => m.ZoneSortPageModule),
    data: {pageTitle: 'Zone Sort', resetFunction: 'resetForm',  showHeader: true},
    canLoad: [AuthGuard] 
  },
  {
    path: 'mobile/landing',
    loadChildren: () => import('./pages/landing/landing.module').then( m => m.LandingPageModule)
  },
  {
    path: 'mobile/bbsort',
    loadChildren: () => import('./pages/bbsort/bbsort.module').then( m => m.BBSortPageModule),
    data: {pageTitle: 'BB Sort', resetFunction: 'resetForm',  showHeader: true},
    canLoad: [AuthGuard] 
  }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
