import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { Book } from 'src/app/models/book.model';
import { AuthService } from 'src/app/services/auth';
import { BookService } from 'src/app/services/book';
import { EditProfileModalComponent } from 'src/app/components/edit-profile-modal/edit-profile-modal.component';
import { EditBookModalComponent } from 'src/app/components/edit-book-modal/edit-book-modal.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {
  public user$!: Observable<User | null>;
  selectedProfileTab: 'genres' | 'pix' | 'addresses' = 'genres';

  constructor(
    private authService: AuthService,
    private bookService: BookService, 
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() { this.user$ = this.authService.currentUser$; }

  setTab(tab: 'genres'|'pix'|'addresses') { this.selectedProfileTab = tab; }

  // Combina pixKey (legacy com separador ||) e pixKeys (lista nova), remove vazios e duplicados
  pixKeysOf(user: User): string[] {
    const fromLegacy = (user.pixKey && user.pixKey.length > 0) ? user.pixKey.split('||') : [];
    const fromList = Array.isArray(user.pixKeys) ? user.pixKeys : [];
    const merged = [...fromLegacy, ...fromList]
      .map(x => (x || '').trim())
      .filter(x => x.length > 0);
    return Array.from(new Set(merged));
  }

  async onEditProfile(user: User) {
    const modal = await this.modalCtrl.create({
      component: EditProfileModalComponent,
      componentProps: { userToEdit: user }
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.authService.updateUser(data).subscribe();
    }
  }

  async onEditSection(user: User, section: 'basic'|'genres'|'pix'|'addresses') {
    const modal = await this.modalCtrl.create({
      component: EditProfileModalComponent,
      componentProps: { userToEdit: user, section }
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') this.authService.updateUser(data).subscribe();
  }

  async onDeleteAccount() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Exclusão',
      message: 'Tem a certeza de que deseja excluir a sua conta? Esta ação não pode ser revertida.',
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'confirm',
          cssClass: 'alert-button-danger',
          handler: () => { this.authService.deleteUser().subscribe(); },
        },
      ],
    });
    await alert.present();
  }

  async onEditBook(book: Book) {
    const modal = await this.modalCtrl.create({
      component: EditBookModalComponent,
      componentProps: { bookToEdit: book },
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.bookService.updateBook(data).subscribe();
    }
  }

  // --- CORREÇÃO APLICADA AQUI ---
  // O parâmetro bookId agora é do tipo 'number'
  async onDeleteBook(bookId: number) {
    const alert = await this.alertCtrl.create({
      header: 'Excluir Livro',
      message: 'Tem a certeza de que deseja excluir este livro?',
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'confirm',
          cssClass: 'alert-button-danger',
          handler: () => {
            this.bookService.deleteBook(bookId).subscribe();
          },
        },
      ],
    });
    await alert.present();
  }

  activeBooks(user: User): Book[] { return (user.books || []).filter(b => (b.status || 'AVAILABLE') === 'AVAILABLE'); }
  archivedBooks(user: User): Book[] { return (user.books || []).filter(b => (b.status && b.status !== 'AVAILABLE') || b.available === false); }

  onRelist(book: Book) {
    if (!book.id) return;
    // Optimistic local update for immediate UI (profile + browse)
    this.authService.applyBookStatus(book.id, 'AVAILABLE');
    this.bookService.updateBookStatus(book.id, 'AVAILABLE').subscribe(() => {
      this.authService.refreshCurrentUser().subscribe();
    });
  }
}