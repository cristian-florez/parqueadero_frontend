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
import { TicketCierreTurnoResponse } from '../models/cierreTurno';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient, private datePipe: DatePipe,

  ) {}

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

  public generarTicketHistorial(cierre: TicketCierreTurnoResponse): string {
    const INIT = '\x1B\x40';
    const ALIGN_CENTER = '\x1B\x61\x01';
    const ALIGN_LEFT = '\x1B\x61\x00';
    const CUT_PARTIAL = '\x1D\x56\x42\x00';
    const SEP = '------------------------\n';

    const formatCOP = (value: number) =>
      '$' + Math.round(value).toLocaleString('es-CO');
    const formatDate = (date: string) =>
      this.datePipe.transform(date, 'dd/MM/yy, h:mm a') || '';

    let out = '';
    out += INIT;
    out += ALIGN_CENTER;
    out += 'ESTACION DE SERVICIO EL SAMAN\n';
    out += 'Copia de Cierre de Turno\n';
    out += SEP;

    out += ALIGN_LEFT;
    out += `${formatDate(cierre.fechaInicio)} - ${formatDate(
      cierre.fechaCierre
    )}\n`;
    out += `Vendedor: ${cierre.nombreUsuario}\n`;
    out += SEP;

    out += `Total Ingresos: ${formatCOP(cierre.total)}\n`;
    out += SEP;

    // recorrer parqueaderos
    for (const [parqueadero, detalle] of Object.entries(
      cierre.detallesPorParqueadero
    )) {
      out += ALIGN_CENTER;
      out += `=== ${parqueadero.toUpperCase()} ===\n`;
      out += ALIGN_LEFT;
      out += `Total a pagar: ${formatCOP(detalle.totalAPagar)}\n`;

      if (detalle.listaVehiculosEntrantes?.length) {
        out += 'Vehículos Entrantes:\n';
        if (detalle.listaTiposVehiculosEntrantes?.length) {
          detalle.listaTiposVehiculosEntrantes.forEach((t) => {
            out += `|${t.tipo}: ${t.cantidad}|`;
          });
          out += '\n';
        }
        detalle.listaVehiculosEntrantes.forEach((v) => {
          out += ` - ${v.placa}--${v.tipo}\n`;
        });
        out += '\n\n';
      }

      if (detalle.listaVehiculosSalientes?.length) {
        out += 'Vehículos Salientes:\n';
        if (detalle.listaTiposVehiculosSalientes?.length) {
          out += 'Tipos Salientes:\n';
          detalle.listaTiposVehiculosSalientes.forEach((t) => {
            out += `|${t.tipo}: ${t.cantidad}|`;
          });
          out += '\n';
        }
        detalle.listaVehiculosSalientes.forEach((v) => {
          out += ` - ${v.placa}--${v.tipo}--${v.totalCobrado}\n`;
        });
        out += '\n\n';
      }

      if (detalle.vehiculosMensualidad?.length) {
        out += 'Vehículos Mensualidad:\n';
        detalle.vehiculosMensualidad.forEach((v) => {
          out += ` - ${v.placa}--${v.tipo}--${v.totalCobrado}\n`;
        });
        out += '\n\n';
      }

      if (detalle.vehiculosEnParqueadero?.length) {
        out += 'Vehículos en Parqueadero:\n';
        if (detalle.listaTiposVehiculosParqueadero?.length) {
          out += 'Tipos en Parqueadero:\n';
          detalle.listaTiposVehiculosParqueadero.forEach((t) => {
            out += `|${t.tipo}: ${t.cantidad}|`;
          });
          out += '\n';
        }
        detalle.vehiculosEnParqueadero.forEach((v) => {
          out += ` - ${v.placa}--${v.tipo}\n`;
        });
        out += '\n\n';
      }

      out += SEP;
      out += SEP;
    }

    out += ALIGN_CENTER;
    out += '¡Gracias por tu buen trabajo!\n\n';
    out += CUT_PARTIAL;

    return out;
  }
}
