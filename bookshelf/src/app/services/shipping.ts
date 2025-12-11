import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ShippingQuoteRequest {
  fromCep: string;
  toCep: string;
  weightKg: number;
  lengthCm: number;
  heightCm: number;
  widthCm: number;
  // Optional: address snapshot for audit/tracking
  addressSnapshot?: {
    label?: string;
    cep: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface ShippingOption {
  serviceCode: string;
  serviceName: string;
  price: number;
  deliveryTime: string;
}

@Injectable({ providedIn: 'root' })
export class ShippingService {
  private apiUrl = `${environment.apiUrl}/shipping`;

  constructor(private http: HttpClient) {}

  quote(req: ShippingQuoteRequest): Observable<ShippingOption[]> {
    return this.http.post<ShippingOption[]>(`${this.apiUrl}/quote`, req);
  }
}
