// ==========================
// archivo: pago.service.ts
// ==========================

// Importaciones necesarias
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pago } from '../models/pago';

// Decorador para indicar que es un servicio inyectable
@Injectable({
  providedIn: 'root', // Hace que el servicio esté disponible en toda la app
})
export class PagoService {
  // URL base tomada desde el environment
  private apiUrl = `${environment.apiUrl}/pagos`;

  // Inyección de HttpClient para hacer peticiones HTTP
  constructor(private http: HttpClient) {}

  // ===============================
  // 1. Obtener todos los pagos
  // ===============================
  getPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.apiUrl);
  }

  // ===============================
  // 2. Obtener pago por ID
  // ===============================
  getPagoById(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`);
  }

  // ===============================
  // 3. Crear nuevo pago
  // ===============================
  createPago(pago: Pago): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, pago);
  }

  // ===============================
  // 4. Actualizar pago por ID
  // ===============================
  updatePago(id: number, pago: Pago): Observable<Pago> {
    return this.http.put<Pago>(`${this.apiUrl}/${id}`, pago);
  }

  // ===============================
  // 5. Eliminar pago por ID
  // ===============================
  deletePago(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  obtenerPago(codigo: string): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/pago/${codigo}`);
  }
}
