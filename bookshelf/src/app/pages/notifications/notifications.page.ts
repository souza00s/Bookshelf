import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NotificationService, AppNotification } from 'src/app/services/notification';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth';
import { BookService } from 'src/app/services/book';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss']
})
export class NotificationsPage {
  constructor(public notif: NotificationService, private auth: AuthService, private http: HttpClient, private books: BookService, private toast: ToastController) {}

  get userId(): number | null { return this.auth.getUserId(); }

  confirmShipping(n: AppNotification) {
    const payload = n.payload;
    if (!payload?.buyerId) return;
    if ((n as any)._sending) return; // prevent double click
    (n as any)._sending = true;
    if ((n as any)._shipped) return; // already processed
    
    // Buscar dados do destinatário (buyerId) para pegar o email
    if (typeof payload.bookId === 'number' && payload.buyerId) {
      this.http.get<any>(`${environment.apiUrl}/users/${payload.buyerId}`).subscribe({
        next: (buyer) => {
          const buyerEmail = buyer.email || '';
          const buyerName = payload.buyerName || buyer.name || '';
          const trackingCode = (payload as any).trackingCode || '';
          
          // Backend: dispara e-mail para o destinatário e registra envio
          this.books.markShipped(payload.bookId!, { buyerEmail, buyerName, trackingCode }).subscribe({
            next: async () => {
              // Atualiza status do livro para SHIPPED
              this.auth.applyBookStatus(payload.bookId as number, 'SHIPPED');
              this.http.patch(`${environment.apiUrl}/books/${payload.bookId}/status`, null, { params: { status: 'SHIPPED' } })
                .subscribe({ next: () => this.auth.refreshCurrentUser().subscribe(), error: () => {} });
              const t = await this.toast.create({ message: 'Envio confirmado. O destinatário foi avisado por e‑mail.', duration: 2500, color: 'success' });
              await t.present();
              
              (n as any)._shipped = true;
              (n as any).read = true;
              setTimeout(() => this.notif.deleteNotification(n.id), 1000);
            },
            error: async () => {
              const t = await this.toast.create({ message: 'Falha ao confirmar envio. Tente novamente.', duration: 2500, color: 'danger' });
              await t.present();
            }
          });
        },
        error: async () => {
          const t = await this.toast.create({ message: 'Não foi possível obter dados do destinatário.', duration: 2500, color: 'danger' });
          await t.present();
        }
      });
    }
  }

  onLoadMore(ev: any) {
    this.notif.fetchMore();
    setTimeout(() => ev.target.complete(), 400); // pequena espera para UX
  }

  isSending(n: AppNotification): boolean { return (n as any)._sending === true; }
  isShippingDone(n: AppNotification): boolean { return (n as any)._shipped === true; }
}
