import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Importe o 'tap'
import { Book } from 'src/app/models/book.model';
import { BookService } from 'src/app/services/book';
import { Location } from '@angular/common';
import { ToastController } from '@ionic/angular';
import { MessageService } from 'src/app/services/message';
import { AuthService } from 'src/app/services/auth'; // Importe o AuthService
import { User } from 'src/app/models/user.model';     // Importe o User model

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.page.html',
  styleUrls: ['./book-detail.page.scss'],
  standalone: false
})
export class BookDetailPage implements OnInit {
  public book$!: Observable<Book | undefined>;
  public isLoading = true;
  public error = false;
  public showDeliveryOptions = false;

  public loggedInUser: User | null = null; // Para guardar o utilizador logado
  public isOwner = false; // Flag para verificar se o utilizador é o dono

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    public location: Location,
    private toastController: ToastController,
    private messageService: MessageService,
    private authService: AuthService // Injete o AuthService
  ) {}

  ngOnInit() {
    this.loggedInUser = this.authService.currentUserValue; // Obtém o utilizador logado

    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.book$ = this.bookService.getBookById(bookId).pipe(
        tap(book => {
          // Lógica para verificar se o utilizador logado é o dono do livro
          if (book && this.loggedInUser && book.owner) {
            this.isOwner = this.loggedInUser.id === book.owner.id;
          }
        }),
        catchError((err) => {
          this.error = true;
          this.presentErrorToast('Não foi possível carregar os detalhes do livro.');
          return EMPTY;
        })
      );
      this.book$.subscribe(() => this.isLoading = false);
    } else {
      this.isLoading = false;
      this.error = true;
    }
  }

  handleRequestBook(book: Book) {
    // --- LÓGICA CORRIGIDA ---
    // Verifica se ambas as opções de entrega estão disponíveis
    if (book.deliveryLocalPickup && book.deliveryShipping) {
      this.showDeliveryOptions = true; // Mostra os botões de escolha
      return; // Para a execução aqui
    }

    // Se apenas uma opção estiver disponível, inicia a conversa diretamente
    this.initiateConversation(book);
  }

  handleDeliveryOption(option: 'pickup' | 'shipping', book: Book) {
    if (option === 'shipping') {
      this.router.navigate(['/shipping-fee'], { queryParams: { bookId: book.id } });
      return;
    }
    // pickup: inicia conversa
    this.initiateConversation(book);
  }

  // Criámos uma função auxiliar para evitar código repetido
  // Dentro da classe BookDetailPage

initiateConversation(book: Book) {
    this.isLoading = true;
    this.messageService.initiateConversation(book).subscribe({
      next: (response: { conversationId: number }) => {
        this.isLoading = false;
        this.router.navigate(['/messages']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.presentErrorToast('Não foi possível iniciar a conversa. Tente novamente.');
        console.error(err);
      }
    });
  }

  async presentErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    toast.present();
  }

  formatCondition(condition: string): string {
    switch (condition) {
      case 'novo': return 'Novo';
      case 'excelente': return 'Excelente';
      case 'bom': return 'Bom';
      case 'usado': return 'Usado';
      default: return condition;
    }
  }

  getConditionColor(condition: string): string {
    switch (condition) {
      case 'novo': return 'success';
      case 'excelente': return 'tertiary';
      case 'bom': return 'warning';
      case 'usado': return 'medium';
      default: return 'medium';
    }
  }
}