import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordRecoveryService } from '../../services/password-recovery';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule],
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss']
})
export class PasswordResetPage {
  form: FormGroup;
  isLoading = false;
  email = '';
  code = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: PasswordRecoveryService,
    private toast: ToastController
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
    this.route.queryParamMap.subscribe(params => {
      this.email = params.get('email') || '';
      this.code = params.get('code') || '';
    });
  }

  async onReset() {
    if (this.form.invalid) return;
    const { newPassword, confirmPassword } = this.form.value;
    if (newPassword !== confirmPassword) {
      return this.presentToast('As senhas não conferem.');
    }
    this.isLoading = true;
    try {
      await this.service.reset(this.email, this.code, newPassword).toPromise();
      await this.presentToast('Senha redefinida com sucesso.');
      this.router.navigate(['/login']);
    } catch (e) {
      await this.presentToast('Falha ao redefinir senha.');
    } finally {
      this.isLoading = false;
    }
  }

  async presentToast(message: string) {
    const t = await this.toast.create({ message, duration: 2500 });
    await t.present();
  }
}
