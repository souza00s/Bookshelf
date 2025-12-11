import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NotificationService, AppNotification } from 'src/app/services/notification';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss']
})
export class NotificationsPage {
  constructor(public notif: NotificationService, private auth: AuthService, private http: HttpClient) {}

  get userId(): number | null { return this.auth.getUserId(); }

  confirmShipping(n: AppNotification) {
    const payload = n.payload;
    if (!payload?.buyerId) return;
  if ((n as any)._sending) return; // prevent double click
  (n as any)._sending = true;
  if ((n as any)._shipped) return; // already processed
    // comprador recebe: envio confirmado
    this.notif.sendTo(
      payload.buyerId,
      `Envio confirmado pelo vendedor para o livro "${payload.bookTitle || ''}". Pacote a caminho!`,
      'SHIPPING_CONFIRMED',
      payload
    );
    // Atualiza status do livro para SHIPPED
    if (payload.bookId) {
      // Otimista: marca como SHIPPED localmente no perfil
      this.auth.applyBookStatus(payload.bookId, 'SHIPPED');
      this.http.patch(`${environment.apiUrl}/books/${payload.bookId}/status`, null, { params: { status: 'SHIPPED' } })
        .subscribe({ next: () => this.auth.refreshCurrentUser().subscribe(), error: () => {} });
    }
  (n as any)._shipped = true;
  // Marca apenas esta notificação como lida e remove após 1s para limpar a lista
  (n as any).read = true;
  setTimeout(() => this.notif.deleteNotification(n.id), 1000);
  }

  onLoadMore(ev: any) {
    this.notif.fetchMore();
    setTimeout(() => ev.target.complete(), 400); // pequena espera para UX
  }

  isSending(n: AppNotification): boolean { return (n as any)._sending === true; }
  isShippingDone(n: AppNotification): boolean { return (n as any)._shipped === true; }
}
