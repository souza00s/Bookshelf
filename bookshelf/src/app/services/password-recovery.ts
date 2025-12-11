import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PasswordRecoveryService {
  private base = `${environment.apiUrl}/auth/password`;

  constructor(private http: HttpClient) {}

  forgot(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/forgot`, { email });
  }

  verify(email: string, code: string): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.base}/verify`, { email, code });
  }

  reset(email: string, code: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/reset`, { email, code, newPassword });
  }
}