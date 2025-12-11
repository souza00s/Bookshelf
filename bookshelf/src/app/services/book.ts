import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Book } from '../models/book.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  // --- MÉTODO CORRIGIDO AQUI ---
  // A 'bookData' que vem da página de doação já está no formato correto que o backend espera.
  // Apenas a passamos diretamente para o pedido HTTP.
  addBook(bookData: Omit<Book, 'id' | 'owner'>): Observable<Book> {
    const token = localStorage.getItem('bookshelf_token');
    const payload = { ...bookData } as any;
    if (token) { delete payload.ownerId; }
    return this.http.post<Book>(this.apiUrl, payload).pipe(
      switchMap(createdBook =>
        this.authService.refreshCurrentUser().pipe(
          map(() => createdBook)
        )
      )
    );
  }
  
  updateBook(updatedBook: Book): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${updatedBook.id}`, updatedBook).pipe(
      switchMap(book =>
        this.authService.refreshCurrentUser().pipe(
          map(() => book)
        )
      )
    );
  }

  deleteBook(bookId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${bookId}`).pipe(
      switchMap(() =>
        this.authService.refreshCurrentUser().pipe(
          map(() => undefined)
        )
      )
    );
  }

  updateBookStatus(bookId: number, status: 'AVAILABLE' | 'RESERVED' | 'SHIPPED' | 'COMPLETED'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${bookId}/status`, null, { params: { status } });
  }
}