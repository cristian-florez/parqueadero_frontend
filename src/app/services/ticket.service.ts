// ==========================
// archivo: ticket.service.ts
// ==========================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ticket } from '../models/ticket';
import { Page } from '../core/types/page';

@Injectable({
  providedIn: 'root'
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

  // ===============================
  // 3. Crear un nuevo ticket
  // ===============================
  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket);
  }

  // ===============================
  // 4. Actualizar un ticket por ID
  // ===============================
  updateTicket(codigo: String, ticket: Ticket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${codigo}`, ticket);
  }

  // ===============================
  // 5. Eliminar un ticket por ID
  // ===============================
  deleteTicket(id: number): Observable<Ticket> {
    return this.http.delete<Ticket>(`${this.apiUrl}/${id}`);
  }
}
