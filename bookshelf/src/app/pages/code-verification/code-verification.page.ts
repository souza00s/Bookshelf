import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PasswordRecoveryService } from '../../services/password-recovery';

@Component({
  selector: 'app-code-verification',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule],
  templateUrl: './code-verification.page.html',
  styleUrls: ['./code-verification.page.scss']
})
export class CodeVerificationPage {
  form: FormGroup;
  isLoading = false;
  email = '';

  constructor(
    private fb: FormBuilder,
    private service: PasswordRecoveryService,
    private toast: ToastController,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
    this.route.queryParamMap.subscribe(params => {
      this.email = params.get('email') || '';
    });
  }

  async onVerify() {
    if (this.form.invalid) return;
    const { code } = this.form.value;
    const email = this.email;
    if (!email) {
      await this.presentToast('E-mail ausente. Volte e solicite o código novamente.');
      return;
    }
    this.isLoading = true;
    try {
      const res = await firstValueFrom(this.service.verify(email, code));
      if (res && res.valid) {
        await this.presentToast('Código verificado.');
        this.router.navigate(['/password-reset'], { queryParams: { email, code } });
      } else {
        await this.presentToast('Código inválido ou expirado.');
      }
    } catch (e) {
      await this.presentToast('Falha ao verificar código.');
    } finally {
      this.isLoading = false;
    }
  }

  async presentToast(message: string) {
    const t = await this.toast.create({ message, duration: 2500 });
    await t.present();
  }
}
