

import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MessageResponseDTO } from '../models/message.model';
import { NotificationService } from './notification';
import { AuthService } from './auth';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;
  private connected = false;
  private rooms = new Set<string>();

  constructor(private zone: NgZone, private notif: NotificationService, private auth: AuthService) {
    this.socket = io.connect(environment.socketUrl, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Socket.IO: Conectado ao servidor!', this.socket.id);
      // Reentra em todas as salas após (re)conectar
  this.rooms.forEach(room => this.socket.emit('joinRoom', room));
  this.bindNotificationChannel();
    });
    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Socket.IO: Desconectado do servidor.');
    });
    // Compatível com socket.io v2: eventos de reconexão
    this.socket.on('reconnect', () => {
      this.connected = true;
      this.rooms.forEach(room => this.socket.emit('joinRoom', room));
      this.bindNotificationChannel();
    });
  }

  private bindNotificationChannel() {
    const uid = this.auth.getUserId();
    if (!uid) return;
    const eventName = `notification:${uid}`;
    this.socket.off(eventName); // evita múltiplos handlers
    this.socket.on(eventName, (data: any) => {
      this.zone.run(() => {
        const normalized = {
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
          payload: {
            bookId: data.bookId,
            bookTitle: data.bookTitle,
            amount: data.amount,
            buyerId: data.buyerId,
            buyerName: data.buyerName,
            sellerId: data.sellerId,
            sellerName: data.sellerName,
            reserved: data.reserved
          }
        };
        (this.notif as any).items$.next([normalized, ...(this.notif as any).items$.value]);

        // Se a notificação indica pagamento confirmado e o usuário atual é o vendedor,
        // atualiza status do livro localmente para refletir "Arquivado/Reservado" no perfil imediatamente.
        try {
          const currentUserId = this.auth.getUserId();
            if (
              currentUserId &&
              normalized.type === 'PAYMENT_CONFIRMED' &&
              normalized.reserved &&
              normalized.sellerId === currentUserId &&
              normalized.bookId
            ) {
              // Mutação otimista local
              (this.auth as any).applyBookStatus(normalized.bookId, 'RESERVED');
              // Faz refresh para garantir consistência (ignorar erro silenciosamente)
              this.auth.refreshCurrentUser().subscribe({ next: () => {}, error: () => {} });
            }
        } catch { /* noop */ }
      });
    });
  }

  joinRoom(conversationId: number) {
    const room = conversationId.toString();
    this.rooms.add(room);
    if (this.connected) {
      this.socket.emit('joinRoom', room);
    }
  }

  leaveRoom(conversationId: number) {
    const room = conversationId.toString();
    this.rooms.delete(room);
    if (this.connected) {
      this.socket.emit('leaveRoom', room);
    }
  }

  sendMessage(message: { conversationId: number; senderId: number; content: string; }) {
    // --- CORREÇÃO APLICADA AQUI ---
    // Removemos o JSON.stringify e enviamos o objeto diretamente.
    this.socket.emit('sendMessage', message);
  }

  getNewMessages(): Observable<MessageResponseDTO> {
    return new Observable<MessageResponseDTO>(observer => {
      const handler = (message: MessageResponseDTO) => {
        // Normaliza timestamp para string ISO e garante conversationId numérico
        const normalized: MessageResponseDTO = {
          ...message,
          conversationId: Number((message as any).conversationId),
          timestamp: typeof (message as any).timestamp === 'string'
            ? (message as any).timestamp
            : new Date().toISOString()
        } as MessageResponseDTO;

        // Garante que o Angular detecte mudanças ao receber o evento do Socket.IO
        this.zone.run(() => observer.next(normalized));
      };
      this.socket.on('newMessage', handler);
      // Teardown para evitar múltiplos listeners ao trocar de tela
      return () => this.socket.off('newMessage', handler);
    });
  }
}