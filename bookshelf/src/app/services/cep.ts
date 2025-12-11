import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export interface AddressFill {
  cep: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

@Injectable({ providedIn: 'root' })
export class CepService {
  constructor(private http: HttpClient) {}

  sanitize(cep: string): string { return (cep || '').replace(/\D/g, ''); }

  format(cep: string): string {
    const digits = this.sanitize(cep).slice(0, 8);
    if (digits.length <= 5) return digits;
    return digits.replace(/(\d{5})(\d{0,3})/, (m, a, b) => (b ? `${a}-${b}` : a));
  }

  readyToLookup(cep: string): boolean { return this.sanitize(cep).length === 8; }

  lookup(cep: string): Observable<AddressFill | null> {
    const clean = this.sanitize(cep);
    if (clean.length !== 8) return new Observable(sub => { sub.next(null); sub.complete(); });
    // Usa proxy do backend para evitar CORS/instabilidade e ter fallback
    return this.http.get<any>(`${environment.apiUrl}/cep/${clean}`).pipe(
      map((res: any) => {
        if (!res) return null;
        return {
          cep: res.cep || clean.replace(/(\d{5})(\d{3})/, '$1-$2'),
          street: res.street || '',
          neighborhood: res.neighborhood || '',
          city: res.city || '',
          state: res.state || ''
        } as AddressFill;
      }),
      catchError(() => of(null))
    );
  }
}
