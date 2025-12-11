import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PasswordRecoveryService } from '../../services/password-recovery';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.page.html',
  styleUrls: ['./password-recovery.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, FormsModule]
})
export class PasswordRecoveryPage {
  emailForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
  private service: PasswordRecoveryService,
  private toast: ToastController,
  private router: Router
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSendCode() {
    if (this.emailForm.invalid) return;
    this.isLoading = true;
    try {
  await this.service.forgot(this.emailForm.value.email).toPromise();
  await this.presentToast('Se o e-mail existir, enviamos um código.');
  const email = this.emailForm.value.email;
  this.router.navigate(['/code-verification'], { queryParams: { email } });
    } catch (e) {
      await this.presentToast('Erro ao solicitar código.');
    } finally {
      this.isLoading = false;
    }
  }


  async presentToast(message: string) {
    const t = await this.toast.create({ message, duration: 2500 });
    await t.present();
  }
}
