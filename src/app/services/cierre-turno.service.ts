// =============================
// archivo: cierre-turno.service.ts
// =============================
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Page } from '../core/types/page';
import { TicketCierreTurnoResponse } from '../models/cierreTurno';

@Injectable({
  providedIn: 'root',
})
export class CierreTurnoService {
  private apiUrl = `${environment.apiUrl}/cierre`;

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo cierre de turno para el usuario logueado.
   */
  crearCierre(): Observable<TicketCierreTurnoResponse> {
    const usuarioData = localStorage.getItem('usuarioActual');
    if (!usuarioData) {
      throw new Error(
        'No se encontró información del usuario en el localStorage.'
      );
    }
    const sesion = JSON.parse(usuarioData);
    const idUsuario = sesion.id;

    return this.http.post<TicketCierreTurnoResponse>(
      `${this.apiUrl}/${idUsuario}`,
      null
    );
  }

  /**
   * Obtener todos los cierres con paginación y filtros opcionales.
   */
  obtenerTodos(
    page: number,
    size: number,
    filtros?: {
      inicio?: string;
      fin?: string;
      usuario?: string;
    }
  ): Observable<Page<TicketCierreTurnoResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<Page<TicketCierreTurnoResponse>>(this.apiUrl, { params });
  }

  /**
   * Obtener un cierre específico por su ID (reimpresión).
   */
  obtenerCierrePorId(id: number): Observable<TicketCierreTurnoResponse> {
    return this.http.get<TicketCierreTurnoResponse>(`${this.apiUrl}/${id}`);
  }
}
