import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { ToastController } from '@ionic/angular'; 

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController 
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    if (this.authService.isAuthenticated()) {
      return true; 
    } else {
      const toast = await this.toastController.create({
        message: 'Você precisa estar logado para aceder a esta página.',
        duration: 3000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();

      return this.router.parseUrl('/login');
    }
  }
}