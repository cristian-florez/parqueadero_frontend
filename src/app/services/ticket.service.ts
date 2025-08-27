// ==========================
// archivo: ticket.service.ts
// ==========================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ticket } from '../models/ticket';
import { Page } from '../core/types/page';
import { TicketCierreTurno } from '../models/cierreTurno';
import { format } from 'date-fns';



@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  // ===============================
  // 1. Obtener todos los tickets
  // ===============================
  getTickets(page: number, size: number): Observable<Page<Ticket>> {
    return this.http.get<Page<Ticket>>(
      `${this.apiUrl}?page=${page}&size=${size}`
    );
  }

  getTicket(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  // ===============================
  // 2. Obtener un ticket por ID
  // ===============================
  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  getTicketByCodigo(codigo: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/codigo/${codigo}`);
  }

  // ===============================
  // 3. Crear un nuevo ticket
  // ===============================
  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket);
  }

  // ===============================
  // 4. Actualizar un ticket por ID
  // ===============================
  updateTicket(codigo: string, ticket: Ticket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/salida/${codigo}`, ticket);
  }

  // ===============================
  // 5. Eliminar un ticket por ID
  // ===============================
  deleteTicket(id: number): Observable<Ticket> {
    return this.http.delete<Ticket>(`${this.apiUrl}/${id}`);
  }

  //
  obtenerDatosCierre(inicio: Date, final: Date): Observable<TicketCierreTurno> {
    const fechaInicio = format(inicio, "yyyy-MM-dd'T'HH:mm:ss");
    const fechaFinal = format(final, "yyyy-MM-dd'T'HH:mm:ss");

    const params = new HttpParams()
      .set('inicio', fechaInicio)
      .set('fin', fechaFinal);

    return this.http.get<TicketCierreTurno>(`${this.apiUrl}/cierre-turno`, {
      params,
    });
  }
}
