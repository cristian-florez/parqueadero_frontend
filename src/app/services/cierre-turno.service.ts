// =============================
// archivo: cierre-turno.service.ts
// =============================
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Page } from '../core/types/page';
import { TicketCierreTurno } from '../models/cierreTurno';
import { TicketCierreResponse } from '../models/cierreTurno';
import { CierreReimpresionResponse } from '../models/cierreTurno';

@Injectable({
  providedIn: 'root',
})
export class CierreTurnoService {
  private apiUrl = `${environment.apiUrl}/cierre`;

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo cierre de turno para el usuario logueado.
   */
  crearCierre(): Observable<TicketCierreTurno> {
    const usuarioData = localStorage.getItem('usuarioActual');
    if (!usuarioData) {
      throw new Error(
        'No se encontró información del usuario en el localStorage.'
      );
    }
    const sesion = JSON.parse(usuarioData);
    const idUsuario = sesion.id;

    return this.http.post<TicketCierreTurno>(
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
    inicio?: string,
    fin?: string,
    usuario?: string
  ): Observable<Page<TicketCierreResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (inicio) params = params.set('inicio', inicio);
    if (fin) params = params.set('fin', fin);
    if (usuario) params = params.set('usuario', usuario);

    return this.http.get<Page<TicketCierreResponse>>(this.apiUrl, { params });
  }

  /**
   * Obtener un cierre específico por su ID (reimpresión).
   */
  obtenerCierrePorId(id: number): Observable<CierreReimpresionResponse> {
    return this.http.get<CierreReimpresionResponse>(`${this.apiUrl}/${id}`);
  }
}
