import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  async onRegister() {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { name, email, password } = this.registerForm.value;

    this.auth.register({ name, email, password }).subscribe({
      next: async () => {
        this.isLoading = false;
        const toast = await this.toastController.create({
          message: 'Cadastro realizado com sucesso!',
          duration: 2000,
          color: 'success'
        });
        toast.present();
        this.router.navigate(['/login']);
      },
      error: async (error) => {
        this.isLoading = false;
        const toast = await this.toastController.create({
          message: error.message || 'Ocorreu um erro no registo.',
          duration: 3000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
