import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Book } from 'src/app/models/book.model';
import { BookService } from 'src/app/services/book';
import { ShippingOption, ShippingQuoteRequest, ShippingService } from 'src/app/services/shipping';
import { Observable, of, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ModalController, ToastController } from '@ionic/angular';
import { PaymentModalComponent } from 'src/app/components/payment-modal/payment-modal.component';
import { NotificationService } from 'src/app/services/notification';
import { AuthService } from 'src/app/services/auth';
import { HttpClient } from '@angular/common/http';
import { CepService } from 'src/app/services/cep';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-shipping-fee',
  templateUrl: './shipping-fee.page.html',
  styleUrls: ['./shipping-fee.page.scss'],
  standalone: false
})
export class ShippingFeePage implements OnInit {
  book$!: Observable<Book>;
  bookId!: string;

  // Simple form state
  toCep = '';
  useSavedAddress = true;
  selectedAddressId: number | null = null;
  newAddressCep = '';
  newAddress = { label: '', cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', country: '' };
  weightKg = 0.3; // default small book
  lengthCm = 20;
  heightCm = 3;
  widthCm = 14;

  options: ShippingOption[] = [];
  selected?: ShippingOption;
  isLoading = false;
  loadingInitial = true;
  loadError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private shippingService: ShippingService,
  private modalCtrl: ModalController,
  private toast: ToastController,
    private notif: NotificationService,
  public auth: AuthService,
  private http: HttpClient,
  private cep: CepService,
  ) { }

  ngOnInit() {
    // Aceita tanto query param (?bookId=) quanto path param (/shipping-fee/:id)
    this.book$ = this.route.paramMap.pipe(
      switchMap(pmap => {
        let id = pmap.get('bookId') || pmap.get('id');
        if (!id) {
          // fallback para query params
          return this.route.queryParamMap.pipe(
            switchMap(q => {
              id = q.get('bookId');
              if (!id) {
                this.loadError = 'Livro não informado.';
                this.loadingInitial = false;
                return of(null as any);
              }
              this.bookId = id;
              return this.fetchBook(id);
            })
          );
        }
        this.bookId = id;
        return this.fetchBook(id);
      })
    );
  }

  sellerPixKeys: string[] = [];

  private fetchSellerPixKeys(ownerId: number) {
    this.http.get<any>(`${environment.apiUrl}/users/${ownerId}`).subscribe({
      next: user => {
        const keysRaw: string[] = (user?.pixKeys && user.pixKeys.length) ? user.pixKeys : (user?.pixKey ? [user.pixKey] : []);
        this.sellerPixKeys = [...new Set(keysRaw.filter(k => !!k))];
      },
      error: () => { this.sellerPixKeys = []; }
    });
  }

  private fetchBook(id: string): Observable<Book> {
    this.loadingInitial = true;
    this.loadError = null;
    return this.bookService.getBookById(id).pipe(
      tap({
        next: book => {
          if (!book) {
            this.loadError = 'Livro não encontrado.';
          } else if (book.owner?.id) {
            this.fetchSellerPixKeys(book.owner.id);
          }
          this.loadingInitial = false;
        },
        error: () => {
          this.loadError = 'Erro ao carregar o livro.';
          this.loadingInitial = false;
        }
      })
    );
  }

  quote() {
    const selectedAddr = this.useSavedAddress
      ? (this.auth.currentUserValue?.addresses?.find(a => a.id === this.selectedAddressId) || null)
      : ({ ...this.newAddress, cep: this.newAddressCep || this.newAddress.cep } as any);
    const finalCep = (selectedAddr?.cep || this.toCep);
    this.toCep = finalCep;
    const req: ShippingQuoteRequest = {
      fromCep: '', // backend will resolve later; kept for mock compatibility
      toCep: this.toCep,
      weightKg: this.weightKg,
      lengthCm: this.lengthCm,
      heightCm: this.heightCm,
      widthCm: this.widthCm,
      addressSnapshot: selectedAddr ? {
        label: selectedAddr.label,
        cep: selectedAddr.cep,
        street: selectedAddr.street,
        number: selectedAddr.number,
        complement: selectedAddr.complement,
        neighborhood: selectedAddr.neighborhood,
        city: selectedAddr.city,
        state: selectedAddr.state,
        country: (selectedAddr as any).country
      } : undefined,
    };
    this.isLoading = true;
    this.shippingService.quote(req).subscribe({
      next: (opts) => { this.options = opts; this.selected = opts[0]; },
      error: (err) => { this.loadError = 'Falha ao calcular frete. Verifique o CEP e tente novamente.'; this.isLoading = false; },
      complete: () => { this.isLoading = false; }
    });
  }

  onNewCepBlur() {
  // Mask while typing and lookup when 8 digits
  this.newAddressCep = this.cep.format(this.newAddressCep || this.newAddress.cep || '');
  const raw = this.cep.sanitize(this.newAddressCep);
  if (raw.length !== 8) return;
  this.cep.lookup(raw).subscribe(fill => {
      if (!fill) return;
      this.newAddressCep = fill.cep;
      this.newAddress.cep = fill.cep;
      this.newAddress.street = this.newAddress.street || fill.street || '';
      this.newAddress.neighborhood = this.newAddress.neighborhood || fill.neighborhood || '';
      this.newAddress.city = this.newAddress.city || fill.city || '';
      this.newAddress.state = this.newAddress.state || fill.state || '';
      if (!this.newAddress.country) this.newAddress.country = 'Brasil';
    });
  }

  selectOption(opt: ShippingOption) { this.selected = opt; }

  async openPayment(pixKey: string | undefined | null) {
    const modal = await this.modalCtrl.create({
      component: PaymentModalComponent,
      componentProps: { pixKey, pixKeys: this.sellerPixKeys, amount: this.selected?.price ?? 0 }
    });
    await modal.present();
    const { role, data } = await modal.onWillDismiss();
  if (role === 'confirm') {
      const me = this.auth.currentUserValue;
      const book = await firstValueFrom(this.book$);
      const amount = this.selected?.price || 0;
      // Marca livro como reservado (otimista no front; backend deve persistir em update endpoint real futuramente)
      if (book?.id) {
        // Optimistic local update for immediate profile refresh
        this.auth.applyBookStatus(book.id, 'RESERVED');
        this.bookService.updateBookStatus(book.id, 'RESERVED')
          .pipe(switchMap(() => this.auth.refreshCurrentUser()))
          .subscribe();
      }
      // Comprador recebe: pagamento confirmado (sem botão)
      this.notif.push(
        `Pagamento confirmado para o livro "${book?.title}". Aguarde a confirmação de envio do doador.`,
        'PAYMENT_CONFIRMED',
        { bookId: book?.id, bookTitle: book?.title, amount, buyerId: me?.id || undefined, buyerName: me?.name, sellerId: book?.owner?.id, sellerName: book?.owner?.name, reserved: true }
      );
      // doador recebe: pagamento confirmado aguardando confirmação de envio (com botão na UI)
      if (book?.owner?.id) {
        this.notif.sendTo(
          book.owner.id,
          `Pagamento de R$ ${amount.toFixed(2)} confirmado para o livro "${book.title}". Confirme o envio quando postar o item.`,
          'PAYMENT_CONFIRMED',
          { bookId: book.id, bookTitle: book.title, amount, buyerId: me?.id || undefined, buyerName: me?.name, sellerId: book.owner.id, sellerName: book.owner.name, reserved: true }
        );
      }
      // Chama backend para marcar pagamento e enviar email ao doador
      if (book?.id) {
        const buyerName = me?.name || '';
        const amountLabel = `R$ ${amount.toFixed(2)}`;
        this.bookService.markPaid(Number(book.id), { buyerName, amount: amountLabel, buyerId: me?.id || undefined }).subscribe({
          next: async () => {
            const t = await this.toast.create({ message: 'Pagamento confirmado. O doador foi avisado por e‑mail.', duration: 2500, color: 'success' });
            await t.present();
            this.router.navigate(['/notifications']);
          },
          error: async () => {
            const t = await this.toast.create({ message: 'Pagamento confirmado, mas falhou notificar o doador.', duration: 2500, color: 'warning' });
            await t.present();
            this.router.navigate(['/notifications']);
          }
        });
      } else {
        this.router.navigate(['/notifications']);
      }
    }
  }

}
