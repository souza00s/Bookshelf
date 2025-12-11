import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {}

  async onLogin() {
    if (this.loginForm.invalid) {
      this.presentToast('Por favor, preencha todos os campos corretamente.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Entrando...',
    });
    await loading.present();

  const { email, password } = this.loginForm.value;

 
  this.auth.login({ email: (email || '').trim(), password }).subscribe({
      next: () => {
        loading.dismiss(); 
        this.router.navigate(['/home']); 
      },
      error: (error) => {
        loading.dismiss(); 
        const backendMsg = typeof error?.error === 'string' ? error.error : error?.message;
        this.presentToast(backendMsg || 'Ocorreu um erro no login.'); 
      }
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      cssClass: 'custom-toast'
    });
    toast.present();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword; 
  }
  
    goToPasswordRecovery() {
      this.router.navigate(['/password-recovery']);
    }
}
