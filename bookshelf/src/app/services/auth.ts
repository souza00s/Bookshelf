import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private usersApiUrl = `${environment.apiUrl}/users`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    const storedUser = localStorage.getItem('bookshelf_user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  register(userData: Pick<User, 'name' | 'email' | 'password'>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: Pick<User, 'email' | 'password'>): Observable<User> {
    return this.http.post<{ token: string; user: User }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(resp => {
        localStorage.setItem('bookshelf_token', resp.token);
        localStorage.setItem('bookshelf_user', JSON.stringify(resp.user));
        this.currentUserSubject.next(resp.user);
      }),
      map(resp => resp.user)
    );
  }

  logout() {
  localStorage.removeItem('bookshelf_token');
    localStorage.removeItem('bookshelf_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private persistUser(user: User) {
    localStorage.setItem('bookshelf_user', JSON.stringify(user));
    this.currentUserSubject.next({ ...user }); // emit new reference
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  updateUser(updatedData: Partial<User>): Observable<User | null> {
    const currentUser = this.currentUserValue;
    if (!currentUser?.id) return of(null);
    return this.http.put<User>(`${this.usersApiUrl}/${currentUser.id}`, updatedData).pipe(
      tap(updatedUser => {
  this.persistUser(updatedUser);
      })
    );
  }

  deleteUser(): Observable<boolean> {
    const currentUser = this.currentUserValue;
    if (!currentUser?.id) return of(false);
    return this.http.delete<boolean>(`${this.usersApiUrl}/${currentUser.id}`).pipe(
      tap(() => this.logout())
    );
  }
  
  refreshCurrentUser(): Observable<User | null> {
    const currentUser = this.currentUserValue;
    if (!currentUser?.id) return of(null);

    return this.http.get<User>(`${this.usersApiUrl}/${currentUser.id}`).pipe(
      tap(refreshedUser => {
  this.persistUser(refreshedUser);
      })
    );
  }

  getUserId(): number | null {
    return this.currentUserSubject.value?.id ?? null;
  }

  // Optimistic local mutation of a book status
  applyBookStatus(bookId: number, status: 'AVAILABLE' | 'RESERVED' | 'SHIPPED' | 'COMPLETED') {
    const user = this.currentUserSubject.value;
    if (!user || !user.books) return;
    const idx = user.books.findIndex(b => b.id === bookId);
    if (idx === -1) return;
    const prev = user.books[idx];
    const updated = { ...prev, status, available: status === 'AVAILABLE' } as any;
    user.books = [
      ...user.books.slice(0, idx),
      updated,
      ...user.books.slice(idx + 1)
    ];
    this.persistUser(user);
  }
}
