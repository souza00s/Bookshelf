import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth';

export type NotificationType = 'PAYMENT_CONFIRMED' | 'SHIPPING_CONFIRMED' | 'INFO';

export interface AppNotificationPayload {
  bookId?: number;
  bookTitle?: string;
  amount?: number;
  buyerId?: number;
  buyerName?: string;
  sellerId?: number;
  sellerName?: string;
  reserved?: boolean;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string; // ISO string for persistence
  // Back-end envia campos "flat"; mantemos payload para retrocompatibilidade
  bookId?: number;
  bookTitle?: string;
  amount?: number;
  buyerId?: number;
  buyerName?: string;
  sellerId?: number;
  sellerName?: string;
  reserved?: boolean;
  payload?: AppNotificationPayload; // legado (usado na UI com fallback)
}

type Store = Record<string, AppNotification[]>; // key: userId string

const STORAGE_KEY = 'bookshelf_notifications';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // items$ mantido público internamente para injeção via SocketService (append em tempo real)
  public items$ = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.items$.asObservable();
  private sub?: Subscription;
  private nextCursor: number | null = null;
  private hasMore = true;
  private loading = false;

  constructor(private auth: AuthService, private http: HttpClient) {
    // load for current user
    this.loadForCurrentUser();
    this.sub = this.auth.currentUser$.subscribe(() => this.loadForCurrentUser());
  }

  private loadForCurrentUser() {
    const uid = this.auth.getUserId();
    if (!uid) { this.items$.next([]); return; }
  // primeira página via scroll endpoint
  this.nextCursor = null;
  this.hasMore = true;
  this.items$.next([]);
  this.fetchMore();
  }

  private getStore(): Store {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveStore(store: Store) { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }

  private upsertForUser(userId: number, item: AppNotification) {
  if (this.auth.getUserId() !== userId) return;
  const exists = this.items$.value.some(n => n.id === item.id);
  if (exists) return; // evita duplicatas (post + socket, por exemplo)
  this.items$.next([item, ...this.items$.value]);
  }

  // send to current user (convenience)
  push(message: string, type: NotificationType = 'INFO', payload?: AppNotificationPayload) {
    const uid = this.auth.getUserId();
    if (!uid) return;
    const body = {
      type,
      message,
      bookId: payload?.bookId,
      bookTitle: payload?.bookTitle,
      amount: payload?.amount,
      buyerId: payload?.buyerId,
      buyerName: payload?.buyerName,
      sellerId: payload?.sellerId,
      sellerName: payload?.sellerName,
      reserved: payload?.reserved
    };
    this.http.post<AppNotification>(`${environment.apiUrl}/notifications/${uid}`, body)
      .subscribe(created => {
        const norm: any = {
          ...created,
          payload: {
            bookId: created.bookId,
            bookTitle: created.bookTitle,
            amount: created.amount,
            buyerId: created.buyerId,
            buyerName: created.buyerName,
            sellerId: created.sellerId,
            sellerName: created.sellerName,
            reserved: (created as any).reserved
          }
        };
        this.upsertForUser(uid, norm);
      });
  }

  // send to specific user (simulate cross-user delivery via localStorage)
  sendTo(userId: number, message: string, type: NotificationType, payload?: AppNotificationPayload) {
    const body = {
      type,
      message,
      bookId: payload?.bookId,
      bookTitle: payload?.bookTitle,
      amount: payload?.amount,
      buyerId: payload?.buyerId,
      buyerName: payload?.buyerName,
      sellerId: payload?.sellerId,
      sellerName: payload?.sellerName,
      reserved: payload?.reserved
    };
    this.http.post<AppNotification>(`${environment.apiUrl}/notifications/${userId}`, body)
      .subscribe(created => {
        const norm: any = {
          ...created,
            payload: {
              bookId: created.bookId,
              bookTitle: created.bookTitle,
              amount: created.amount,
              buyerId: created.buyerId,
              buyerName: created.buyerName,
              sellerId: created.sellerId,
              sellerName: created.sellerName,
              reserved: (created as any).reserved
            }
        };
        this.upsertForUser(userId, norm);
      });
  }

  markAllRead() {
    const uid = this.auth.getUserId();
    if (!uid) return;
    this.http.post(`${environment.apiUrl}/notifications/${uid}/read-all`, {})
      .subscribe(() => {
        this.items$.next(this.items$.value.map(n => ({ ...n, read: true })));
      });
  }

  unreadCount(): number {
    return this.items$.value.filter(n => !n.read).length;
  }

  deleteNotification(id: string | number) {
    const uid = this.auth.getUserId();
    if (!uid) return;
    this.http.delete(`${environment.apiUrl}/notifications/${uid}/${id}`).subscribe(() => {
      this.items$.next(this.items$.value.filter(n => n.id !== id));
    });
  }

  canLoadMore(): boolean { return this.hasMore && !this.loading; }

  fetchMore() {
    const uid = this.auth.getUserId();
    if (!uid || !this.canLoadMore()) return;
    this.loading = true;
    const params: any = { limit: 20 };
    if (this.nextCursor) params.cursor = this.nextCursor;
    this.http.get<any>(`${environment.apiUrl}/notifications/${uid}/scroll`, { params })
      .subscribe(res => {
        const mapped = res.items.map((n: any) => ({
          ...n,
          createdAt: n.createdAt,
          payload: {
            bookId: n.bookId,
            bookTitle: n.bookTitle,
            amount: n.amount,
            buyerId: n.buyerId,
            buyerName: n.buyerName,
            sellerId: n.sellerId,
            sellerName: n.sellerName,
            reserved: n.reserved
          }
        }));
        const merged = [...this.items$.value, ...mapped];
        this.items$.next(merged);
        this.nextCursor = res.nextCursor;
        this.hasMore = res.hasMore;
        this.loading = false;
      }, () => { this.loading = false; });
  }
}
