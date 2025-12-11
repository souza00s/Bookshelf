import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth';
import { Book } from 'src/app/models/book.model';
import { BookService } from 'src/app/services/book';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.page.html',
  styleUrls: ['./browse.page.scss'],
  standalone: false
})
export class BrowsePage implements OnInit {
  private allBooks = new BehaviorSubject<Book[]>([]);
  public filteredBooks$!: Observable<Book[]>;

  public showFilters = false;
  public filterForm: FormGroup;

  constructor(private bookService: BookService, private auth: AuthService) {
    this.filterForm = new FormGroup({
      searchTerm: new FormControl(''),
      condition: new FormControl(''),
      genre: new FormControl(''),
      delivery: new FormControl(''),
    });
  }

  ngOnInit() {
    this.bookService.getAllBooks().subscribe(books => this.allBooks.next(books));

    // Escuta mudanças do usuário (ex: após adicionar livro) e injeta livros novos sem recarregar página
    this.auth.currentUser$.subscribe(user => {
      if (!user || !user.books) return;
      const current = this.allBooks.value;
      const userBooks = user.books;

      // Detect missing books
      const missing = userBooks.filter(nb => !current.some(b => b.id === nb.id));

      // Detect changed status for existing books
      let changed = false;
      const updatedExisting = current.map(b => {
        const nb = userBooks.find(ub => ub.id === b.id);
        if (nb) {
          const prevStatus = b.status || (b.available ? 'AVAILABLE' : 'RESERVED');
            const newStatus = nb.status || (nb.available ? 'AVAILABLE' : 'RESERVED');
          if (prevStatus !== newStatus) {
            changed = true;
            return { ...b, status: nb.status, available: nb.available };
          }
        }
        return b;
      });

      if (missing.length || changed) {
        this.allBooks.next([...missing, ...updatedExisting]);
      }
    });

    this.filteredBooks$ = combineLatest([
      this.allBooks,
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))
    ]).pipe(
      map(([books, filters]) => {
  let filtered = books.filter(b => (b.status ? b.status === 'AVAILABLE' : b.available));

        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          filtered = filtered.filter(book =>
            book.title.toLowerCase().includes(term) ||
            book.author.toLowerCase().includes(term)
          );
        }
        if (filters.condition) {
          filtered = filtered.filter(book => book.condition === filters.condition);
        }
        if (filters.genre) {
          filtered = filtered.filter(book => book.genre === filters.genre);
        }
        if (filters.delivery === 'localPickup') {
          filtered = filtered.filter(book => book.deliveryLocalPickup); 
        } else if (filters.delivery === 'shipping') {
          filtered = filtered.filter(book => book.deliveryShipping); 
        }

  return filtered;
      })
    );
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  clearFilters() {
    this.filterForm.reset({
      searchTerm: '',
      condition: '',
      genre: '',
      delivery: ''
    });
  }

  setDelivery(val: string) { this.filterForm.patchValue({ delivery: val }); }
}