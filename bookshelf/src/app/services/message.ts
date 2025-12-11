import { Injectable } from '@angular/core';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Conversation } from '../models/conversation.model';
import { Book } from '../models/book.model';
import { AuthService } from './auth';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SocketService } from './socket';
import { MessageResponseDTO } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/messages`;

  // --- MUDANÇA 1: Adicionamos um BehaviorSubject para guardar e emitir as conversas ---
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private socketService: SocketService
  ) {}

  // --- MUDANÇA 2: O método agora busca os dados e atualiza o BehaviorSubject ---
  getConversations(): Observable<Conversation[]> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.conversationsSubject.next([]);
      return of([]);
    }

    const params = new HttpParams().set('userId', currentUser.id.toString());
    
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`, { params }).pipe(
      map(conversations => {
        let totalUnread = 0;
        const mapped = conversations.map(convo => {
          convo.otherUser = convo.participants.find(p => p.id !== currentUser.id);
          if (convo.messages && convo.messages.length > 0) {
            convo.lastMessage = convo.messages[convo.messages.length - 1];
          }
          // Unread calculation: messages whose sender != current user
          const unread = (convo.messages || []).filter(m => m.sender.id !== currentUser.id).length;
          convo.unreadCount = unread;
          totalUnread += unread;
          return convo;
        });
        this.unreadCountSubject.next(totalUnread);
        return mapped;
      }),
      tap(conversations => {
        // Atualiza todos os 'ouvintes' com a nova lista de conversas
        this.conversationsSubject.next(conversations);
      }),
      catchError(err => {
        console.error('Erro ao buscar conversas:', err);
        this.conversationsSubject.next([]);
        return throwError(() => new Error('Não foi possível carregar as conversas.'));
      })
    );
  }

  // --- MUDANÇA 3: A lógica de iniciar conversa agora também atualiza a lista ---
  initiateConversation(book: Book): Observable<{ conversationId: number }> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !book.owner) {
      return throwError(() => new Error('Utilizador ou dono do livro não encontrado.'));
    }

    const payload = {
      bookId: book.id,
      requesterId: currentUser.id,
      bookOwnerId: book.owner.id,
    };

    return this.http.post<{ conversationId: number }>(`${this.apiUrl}/conversations/initiate`, payload).pipe(
      // Após criar a conversa, buscamos a lista atualizada
      tap(() => this.getConversations().subscribe())
    );
  }

  // O resto do serviço permanece igual
  deleteConversation(conversationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conversations/${conversationId}`).pipe(
      tap(() => this.getConversations().subscribe()) // Atualiza a lista após excluir
    );
  }
  
  sendMessage(conversationId: number, content: string): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;
    const messagePayload = {
      conversationId,
      senderId: currentUser.id,
      content: content.trim()
    };
    this.socketService.sendMessage(messagePayload);
  }

  getNewMessages(): Observable<MessageResponseDTO> {
    return this.socketService.getNewMessages().pipe(
      tap(msg => {
        const convos = this.conversationsSubject.value.slice();
        const idx = convos.findIndex(c => c.id === msg.conversationId);
        const currentUser = this.authService.currentUserValue;
        if (idx !== -1) {
          convos[idx].messages = [...(convos[idx].messages || []), msg];
          convos[idx].lastMessage = msg;
          if (currentUser && msg.sender.id !== currentUser.id) {
            convos[idx].unreadCount = (convos[idx].unreadCount || 0) + 1;
            const total = convos.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
            this.unreadCountSubject.next(total);
          }
          this.conversationsSubject.next(convos);
        } else {
          // Optionally refresh conversations if unknown conversation arrives
          this.getConversations().subscribe();
        }
      })
    );
  }

  unreadMessagesCount(): number { return this.unreadCountSubject.value; }
}