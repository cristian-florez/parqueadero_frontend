// =============================
// archivo: ticket.service.ts
// =============================
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TicketEntradaRequest } from '../models/tickets';
import { TicketMensualidadRequest } from '../models/tickets';
import { TicketSalidaRequest } from '../models/tickets';
import { TicketResponse } from '../models/tickets';
import { Page } from '../core/types/page';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los tickets con paginación y filtros opcionales.
   */
  obtenerTodos(
    page: number,
    size: number,
    filtros?: {
      codigo?: string;
      placa?: string;
      tipo?: string;
      usuarioRecibio?: string;
      usuarioEntrego?: string;
      parqueadero?: string;
      fechaInicio?: string;
      fechaFin?: string;
      pagado?: boolean;
    }
  ): Observable<Page<TicketResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http
      .get<Page<TicketResponse>>(this.apiUrl, { params, observe: 'response' })
      .pipe(
        map((response: HttpResponse<Page<TicketResponse>>) => {
          if (response.status === 204) {
            // Si no hay contenido, devuelve una página vacía para evitar errores.
            return {
              content: [],
              totalElements: 0,
              totalPages: 0,
              number: page,
              size: size,
            } as Page<TicketResponse>;
          }
          // Si hay contenido, devuelve el cuerpo de la respuesta.
          return response.body as Page<TicketResponse>;
        })
      );
  }

  /**
   * Buscar ticket por ID.
   */
  obtenerPorId(id: number): Observable<TicketResponse> {
    return this.http.get<TicketResponse>(`${this.apiUrl}/id/${id}`);
  }

  /**
   * Buscar ticket por código. sirve para reimpresion del ticket
   */
  obtenerPorCodigo(codigo: string): Observable<TicketResponse> {
    return this.http.get<TicketResponse>(`${this.apiUrl}/codigo/${codigo}`);
  }

  /**
   * Crear ticket de entrada de vehículo.
   */
  crearEntrada(request: TicketEntradaRequest): Observable<TicketResponse> {
    return this.http.post<TicketResponse>(`${this.apiUrl}/entrada`, request);
  }

  /**
   * Crear ticket de mensualidad.
   */
  crearMensualidad(
    request: TicketMensualidadRequest
  ): Observable<TicketResponse> {
    return this.http.post<TicketResponse>(
      `${this.apiUrl}/mensualidad`,
      request
    );
  }

  /**
   * Actualizar salida de ticket.
   */
  actualizarSalida(request: TicketSalidaRequest): Observable<TicketResponse> {
    return this.http.put<TicketResponse>(`${this.apiUrl}/salida`, request);
  }

  /**
   * Eliminar ticket por ID.
   */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
