import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Book } from 'src/app/models/book.model';
import { AuthService } from 'src/app/services/auth';
import { CepService } from 'src/app/services/cep';
import { BookService } from 'src/app/services/book';
import { firstValueFrom } from 'rxjs';

// --- CORREÇÃO APLICADA AQUI NO VALIDADOR ---
export const atLeastOneCheckboxCheckedValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const localPickup = control.get('deliveryLocalPickup'); // Nome corrigido
  const shipping = control.get('deliveryShipping');      // Nome corrigido

  return localPickup && shipping && !localPickup.value && !shipping.value
    ? { atLeastOneRequired: true }
    : null;
};

@Component({
  selector: 'app-donate',
  templateUrl: './donate.page.html',
  styleUrls: ['./donate.page.scss'],
  standalone: false,
})
export class DonatePage implements OnInit {
  donateForm: FormGroup;
  isSubmitting = false;
  imagePreview: string | ArrayBuffer | null = null;
  // Address selection state
  useSavedAddress = true;
  selectedAddressId: number | null = null;
  newAddress = { label: '', cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', country: '' };
  saveNewAddressToProfile = true;
  get lacksPix(): boolean {
    const u = this.authService.currentUserValue as any;
    const legacy = !!(u?.pixKey && String(u.pixKey).trim());
    const list = Array.isArray(u?.pixKeys) ? u.pixKeys.filter((x: any) => !!String(x || '').trim()).length : 0;
    return !(legacy || list > 0);
  }

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    public authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private cep: CepService
  ) {
    // --- CORREÇÃO APLICADA AQUI NA CRIAÇÃO DO FORMULÁRIO ---
    this.donateForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      condition: ['', Validators.required],
      genre: ['', Validators.required],
      description: [''],
      deliveryLocalPickup: [true],  // Nome corrigido de 'localPickup'
      deliveryShipping: [false], // Nome corrigido de 'shipping'
      coverImage: [null, Validators.required]
    }, { validators: atLeastOneCheckboxCheckedValidator });
  }

  ngOnInit() {
    // Se o usuário não tiver endereço salvo com CEP, padroniza para "novo endereço"
    const cu = this.authService.currentUserValue;
    const hasSavedAddressWithCep = (cu?.addresses || []).some(a => a && a.cep && a.cep.trim().length > 0);
    if (!hasSavedAddressWithCep) {
      this.useSavedAddress = false;
    }
  }

  // Auto-preencher endereço ao digitar CEP novo
  onCepChange() {
    // Mask as user types and auto-lookup when 8 digits
    this.newAddress.cep = this.cep.format(this.newAddress.cep || '');
    const raw = this.cep.sanitize(this.newAddress.cep);
    if (raw.length !== 8) return;
    this.cep.lookup(raw).subscribe(fill => {
      if (!fill) return;
      this.newAddress.cep = fill.cep;
      this.newAddress.street = this.newAddress.street || fill.street || '';
      this.newAddress.neighborhood = this.newAddress.neighborhood || fill.neighborhood || '';
      this.newAddress.city = this.newAddress.city || fill.city || '';
      this.newAddress.state = this.newAddress.state || fill.state || '';
      if (!this.newAddress.country) this.newAddress.country = 'Brasil';
    });
  }

  handleImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.donateForm.patchValue({ coverImage: file });
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.imagePreview = null;
    this.donateForm.patchValue({ coverImage: null });
    const fileInput = document.getElementById('coverImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  triggerImageInputClick() {
    document.getElementById('coverImageInput')?.click();
  }

  async onSubmit() {
    if (this.lacksPix) {
      this.presentToast('Cadastre ao menos uma chave PIX no seu perfil para doar um livro.');
      this.router.navigate(['/profile']);
      return;
    }
    if (this.donateForm.invalid) {
      if (this.donateForm.errors?.['atLeastOneRequired']) {
          this.presentToast('Por favor, selecione pelo menos uma opção de entrega.');
      } else {
          this.presentToast('Por favor, preencha todos os campos obrigatórios (*).');
      }
      return;
    }
    this.isSubmitting = true;

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.isSubmitting = false;
      this.presentToast('Erro: Utilizador não encontrado. Por favor, faça login novamente.');
      return;
    }

    // Garante que há um token válido para autenticar o POST /api/books
    const token = localStorage.getItem('bookshelf_token');
    if (!token) {
      this.isSubmitting = false;
      this.presentToast('Sua sessão expirou. Entre novamente para doar um livro.');
      this.router.navigate(['/login']);
      return;
    }

    // Guarda: precisa de endereço dependendo da escolha
    const hasSavedAddressWithCep = (currentUser.addresses || []).some(a => a && a.cep && a.cep.trim().length > 0);

    const formValue = this.donateForm.value;

    // Address guard: if user opted new address, optionally save to profile before donating
    const current = await (async () => this.authService.currentUserValue)();
    const usingSavedAddress = this.useSavedAddress && hasSavedAddressWithCep;
    if (!usingSavedAddress) {
      if (!this.newAddress.cep || !this.newAddress.cep.trim()) {
        this.presentToast('Informe pelo menos um endereço para completar a doação.');
        this.isSubmitting = false;
        return;
      }
      // Se não há endereço salvo com CEP, precisamos salvar pelo menos um no perfil
      const mustPersistAddress = !hasSavedAddressWithCep || this.saveNewAddressToProfile;
      if (mustPersistAddress) {
        const updatedAddresses = [...(current?.addresses || []), { ...this.newAddress }];
        try {
          await firstValueFrom(this.authService.updateUser({ addresses: updatedAddresses }));
        } catch {
          this.presentToast('Falha ao salvar o novo endereço no perfil.');
          this.isSubmitting = false;
          return;
        }
      }
    }

    // Guarda adicional: precisa ter ao menos uma chave PIX para doar (mesma regra do backend)
    const hasPix = !!(current?.pixKey && current.pixKey.trim()) || Array.isArray((current as any)?.pixKeys) && (current as any).pixKeys.length > 0;
    if (!hasPix) {
      this.isSubmitting = false;
      this.presentToast('Cadastre ao menos uma chave PIX no seu perfil para doar um livro.');
      this.router.navigate(['/profile']);
      return;
    }

    const bookData = {
      title: formValue.title,
      author: formValue.author,
      coverUrl: this.imagePreview as string,
      description: formValue.description,
      genre: formValue.genre,
      condition: formValue.condition,
      deliveryLocalPickup: formValue.deliveryLocalPickup,
      deliveryShipping: formValue.deliveryShipping,
      available: true, // <-- NOME CORRIGIDO AQUI
      ownerId: currentUser.id
    };

    this.bookService.addBook(bookData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.presentToast('Livro doado com sucesso! Obrigado.', 'success');
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err?.status === 401) {
          this.presentToast('Sessão expirada ou não autenticada. Faça login novamente.');
          this.router.navigate(['/login']);
        } else if (err?.status === 400 && typeof err?.error === 'string' && err.error.includes('PIX')) {
          this.presentToast(err.error);
          this.router.navigate(['/profile']);
        } else if (err?.status === 400 && typeof err?.error === 'string' && err.error.includes('CEP')) {
          this.presentToast(err.error);
          this.router.navigate(['/profile']);
        } else {
          this.presentToast('Ocorreu um erro no servidor ao doar o livro.');
        }
        console.error(err);
      }
    });
  }

  async presentToast(message: string, color: 'danger' | 'success' = 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color
    });
    toast.present();
  }
}