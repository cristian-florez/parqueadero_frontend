// ==========================
// archivo: tarifa.service.ts
// ==========================

// Importaciones necesarias
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tarifa } from '../models/tarifa';

// Decorador para indicar que es un servicio inyectable
@Injectable({
  providedIn: 'root' // Hace que el servicio esté disponible en toda la app
})
export class TarifaService {

  // URL base tomada desde el environment
  private apiUrl = `${environment.apiUrl}/tarifas`;

  // Inyección de HttpClient para hacer peticiones HTTP
  constructor(private http: HttpClient) {}

  // ===============================
  // 1. Obtener todas las tarifas
  // ===============================
  getTarifas(): Observable<Tarifa[]> {
    return this.http.get<Tarifa[]>(this.apiUrl);
  }

  // ===============================
  // 2. Obtener tarifa por ID
  // ===============================
  getTarifaById(id: number): Observable<Tarifa> {
    return this.http.get<Tarifa>(`${this.apiUrl}/${id}`);
  }

  // ===============================
  // 3. Crear nueva tarifa
  // ===============================
  createTarifa(tarifa: Tarifa): Observable<Tarifa> {
    return this.http.post<Tarifa>(this.apiUrl, tarifa);
  }

  // ===============================
  // 4. Actualizar tarifa por ID
  // ===============================
  updateTarifa(id: number, tarifa: Tarifa): Observable<Tarifa> {
    return this.http.put<Tarifa>(`${this.apiUrl}/${id}`, tarifa);
  }

  // ===============================
  // 5. Eliminar tarifa por ID
  // ===============================
  deleteTarifa(id: number): Observable<Tarifa> {
    return this.http.delete<Tarifa>(`${this.apiUrl}/${id}`);
  }
}
