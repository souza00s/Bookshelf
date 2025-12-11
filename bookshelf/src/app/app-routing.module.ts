import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MainComponent } from './layouts/main/main.component'; 
import { AuthGuard } from './services/auth-guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule)
  },
  { path: 'password-recovery', loadComponent: () => import('./pages/password-recovery/password-recovery.page').then(m => m.PasswordRecoveryPage) },
  { path: 'code-verification', loadComponent: () => import('./pages/code-verification/code-verification.page').then(m => m.CodeVerificationPage) },
  { path: 'password-reset', loadComponent: () => import('./pages/password-reset/password-reset.page').then(m => m.PasswordResetPage) },

  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'browse',
        loadChildren: () => import('./pages/browse/browse.module').then(m => m.BrowsePageModule)
      },
      {
        path: 'book-detail/:id', 
        loadChildren: () => import('./pages/book-detail/book-detail.module').then(m => m.BookDetailPageModule)
      },
      {
        path: 'donate',
        canActivate: [AuthGuard],
        loadChildren: () => import('./pages/donate/donate.module').then(m => m.DonatePageModule)
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'messages',
        canActivate: [AuthGuard],
        loadChildren: () => import('./pages/messages/messages.module').then(m => m.MessagesPageModule)
      },
      {
        path: 'shipping-fee',
        canActivate: [AuthGuard],
        loadChildren: () => import('./pages/shipping-fee/shipping-fee.module').then(m => m.ShippingFeePageModule)
      },
      {
        path: 'notifications',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/notifications/notifications.page').then(m => m.NotificationsPage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }