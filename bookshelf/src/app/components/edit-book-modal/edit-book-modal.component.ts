import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Book } from 'src/app/models/book.model';

// Validador personalizado
export const atLeastOneCheckboxCheckedValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const localPickup = control.get('deliveryLocalPickup');
  const shipping = control.get('deliveryShipping');

  return localPickup && shipping && !localPickup.value && !shipping.value
    ? { atLeastOneRequired: true }
    : null;
};

@Component({
  selector: 'app-edit-book-modal',
  templateUrl: './edit-book-modal.component.html',
  styleUrls: ['./edit-book-modal.component.scss'],
  standalone: true,
  imports: [ CommonModule, IonicModule, ReactiveFormsModule ]
})
export class EditBookModalComponent implements OnInit {
  @Input() bookToEdit!: Book;
  editForm: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      condition: ['', Validators.required],
      genre: [''],
      description: [''],
  coverUrl: [null],
      deliveryLocalPickup: [false],
      deliveryShipping: [false]
    }, { validators: atLeastOneCheckboxCheckedValidator }); // Validador adicionado aqui
  }

  ngOnInit() {
    this.editForm.patchValue({
      title: this.bookToEdit.title,
      author: this.bookToEdit.author,
      condition: this.bookToEdit.condition,
      genre: this.bookToEdit.genre,
      description: this.bookToEdit.description,
      deliveryLocalPickup: this.bookToEdit.deliveryLocalPickup,
  deliveryShipping: this.bookToEdit.deliveryShipping,
  coverUrl: this.bookToEdit.coverUrl
    });
    this.imagePreview = this.bookToEdit.coverUrl;
  }

  handleImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
  this.editForm.patchValue({ coverUrl: this.imagePreview });
    };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.imagePreview = null;
  this.editForm.patchValue({ coverUrl: null });
    const fileInput = document.getElementById('coverImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  triggerImageInputClick() {
    document.getElementById('coverImageInput')?.click();
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onSave() {
    if (this.editForm.invalid) {
      // Se quiser, pode adicionar um toast aqui para avisar o usuário
      return;
    }

    const formValue = this.editForm.value as Partial<Book> & { coverUrl?: string | null };
    const updatedData: Book = {
      ...this.bookToEdit,
      ...formValue,
      coverUrl: formValue.coverUrl !== undefined ? formValue.coverUrl as string | null : this.bookToEdit.coverUrl
    } as Book;
    
    this.modalCtrl.dismiss(updatedData, 'confirm');
  }
}