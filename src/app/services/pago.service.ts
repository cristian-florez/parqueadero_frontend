// =============================
// archivo: pago.service.ts
// =============================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private apiUrl = `${environment.apiUrl}/pagos`;

  constructor(private http: HttpClient) {}

  /**
   * Calcular el total a pagar por un ticket a partir de su código.
   */
  calcularTotal(codigo: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/calcular-total/${codigo}`);
  }
}
