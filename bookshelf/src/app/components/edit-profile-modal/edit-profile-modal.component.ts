import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Address, User } from 'src/app/models/user.model';
import { CepService } from 'src/app/services/cep';

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss'],
  standalone: true,
  imports: [ CommonModule, IonicModule, ReactiveFormsModule, FormsModule ]
})
export class EditProfileModalComponent implements OnInit {
  @Input() userToEdit!: User;
  @Input() section: 'basic' | 'genres' | 'pix' | 'addresses' = 'basic';
  editForm: FormGroup;
  maxDescriptionLength = 250;
  imagePreview: string | ArrayBuffer | null = null; // Para a pré-visualização
  // PIX keys control (multiple)
  pixKeys: string[] = [];
  newPixKeyInput: string = '';
  // Addresses control
  addresses: Address[] = [];
  newAddress: Address = { cep: '' };

  genreOptions = [
    'Romance', 'Ficção', 'Não-Ficção', 'Fantasia', 'Científico',
    'Biografia', 'Infantil', 'Terror', 'Suspense', 'Poesia'
  ];

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private cep: CepService
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.maxLength(this.maxDescriptionLength)],
      favoriteGenres: [[]],
      avatarUrl: [null], // Campo para a imagem em Base64
  pixKey: [''], // Campo serializado (chaves separadas por ||)
  addresses: [[]]
    });
  }

  ngOnInit() {
    if (this.userToEdit) {
      this.editForm.patchValue({
        name: this.userToEdit.name,
        description: this.userToEdit.description || '',
        favoriteGenres: this.userToEdit.favoriteGenres || [],
        avatarUrl: this.userToEdit.avatarUrl || null,
        pixKey: this.userToEdit.pixKey || ''
      });
      // Define a pré-visualização inicial
      if (this.userToEdit.avatarUrl) {
        this.imagePreview = this.userToEdit.avatarUrl;
      }
      // Unificar chaves PIX de legacy (pixKey "||") e lista nova (pixKeys)
      const legacy = (this.userToEdit.pixKey ? this.userToEdit.pixKey.split('||') : []) as string[];
      const list = Array.isArray(this.userToEdit.pixKeys) ? this.userToEdit.pixKeys : [];
      const merged = [...legacy, ...list]
        .map(k => (k || '').trim())
        .filter(k => k.length > 0);
      this.pixKeys = Array.from(new Set(merged));
  this.syncPixKeyField();
  // Addresses
  this.addresses = (this.userToEdit.addresses || []).map(a => ({...a}));
  this.syncAddressesField();
    }
  }

  // --- LÓGICA DE IMAGEM IGUAL À DO LIVRO ---

  handleImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      this.editForm.patchValue({ avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.imagePreview = null;
    this.editForm.patchValue({ avatarUrl: null });
    const fileInput = document.getElementById('avatarImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  triggerImageInputClick() {
    document.getElementById('avatarImageInput')?.click();
  }

  // --- FIM DA LÓGICA DE IMAGEM ---

  // ViaCEP auto-preencher quando CEP perder foco
  onCepBlur() {
    const cep = this.newAddress.cep || '';
    this.cep.lookup(cep).subscribe(fill => {
      if (!fill) return;
      this.newAddress.cep = fill.cep;
      this.newAddress.street = this.newAddress.street || fill.street || '';
      this.newAddress.neighborhood = this.newAddress.neighborhood || fill.neighborhood || '' as any;
      this.newAddress.city = this.newAddress.city || fill.city || '';
      this.newAddress.state = this.newAddress.state || fill.state || '';
      if (!(this.newAddress as any).country) (this.newAddress as any).country = 'Brasil';
    });
  }

  // Máscara e busca em tempo real durante a digitação
  onCepInput() {
    this.newAddress.cep = this.cep.format(this.newAddress.cep || '');
    const raw = this.cep.sanitize(this.newAddress.cep);
    if (raw.length !== 8) return;
    this.cep.lookup(raw).subscribe(fill => {
      if (!fill) return;
      this.newAddress.cep = fill.cep;
      this.newAddress.street = this.newAddress.street || fill.street || '';
      this.newAddress.neighborhood = this.newAddress.neighborhood || fill.neighborhood || '' as any;
      this.newAddress.city = this.newAddress.city || fill.city || '';
      this.newAddress.state = this.newAddress.state || fill.state || '';
      if (!(this.newAddress as any).country) (this.newAddress as any).country = 'Brasil';
    });
  }

  toggleGenre(genre: string) {
    const currentGenres = this.editForm.get('favoriteGenres')?.value as string[] || [];
    const updatedGenres = currentGenres.includes(genre)
      ? currentGenres.filter(g => g !== genre)
      : [...currentGenres, genre];
    this.editForm.get('favoriteGenres')?.setValue(updatedGenres);
  }

  isGenreSelected(genre: string): boolean {
    const currentGenres = this.editForm.get('favoriteGenres')?.value as string[] || [];
    return currentGenres.includes(genre);
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onSave() {
    if (this.editForm.invalid) return;
    // sincroniza antes de salvar
    this.syncPixKeyField();
    this.syncAddressesField();
    // Monta payload incluindo lista de pixKeys deduplicada/trimada
    const cleaned = this.pixKeys.map(k => (k || '').trim()).filter(k => k.length > 0);
    const payload: any = {
      ...this.editForm.value,
      pixKeys: cleaned
    };
    // Mantém compatibilidade, mas se a lista estiver vazia, zera a string também
    payload.pixKey = cleaned.join('||');
    this.modalCtrl.dismiss(payload, 'confirm');
  }

  // --- PIX multiple helpers ---
  addPixKey() {
    const v = (this.newPixKeyInput || '').trim();
    if (!v) return;
    if (!this.pixKeys.includes(v)) {
      this.pixKeys.push(v);
      this.syncPixKeyField();
    }
    this.newPixKeyInput = '';
  }

  removePixKey(index: number) {
    this.pixKeys.splice(index, 1);
    this.syncPixKeyField();
  }

  private syncPixKeyField() {
    this.editForm.patchValue({ pixKey: this.pixKeys.join('||') });
  }

  // --- Address helpers ---
  addAddress() {
    const a = this.newAddress;
    if (!a || !a.cep || !a.cep.trim()) return;
    this.addresses.push({ ...a });
    this.newAddress = { cep: '' };
    this.syncAddressesField();
  }

  removeAddress(index: number) {
    this.addresses.splice(index, 1);
    this.syncAddressesField();
  }

  private syncAddressesField() {
    this.editForm.patchValue({ addresses: this.addresses });
  }
}