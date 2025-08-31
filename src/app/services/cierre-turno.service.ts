// =============================
// archivo: cierre-turno.service.ts
// =============================
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CierreTurno, TicketCierreTurno } from '../models/cierreTurno';
import { format } from 'date-fns';
import { Page } from '../core/types/page';

@Injectable({
  providedIn: 'root'
})
export class CierreTurnoService {

  private apiUrl = `${environment.apiUrl}/cierre-turno`;

  constructor(private http: HttpClient) { }

  /**
   * Llama al backend para crear y guardar un nuevo cierre de turno.
   * @param inicio Fecha y hora de inicio del turno.
   * @param fin Fecha y hora de fin del turno (opcional).
   * @returns Un Observable con el DTO TicketCierreTurno para la impresión.
   */
  crearCierre(inicio: Date, fin?: Date): Observable<TicketCierreTurno> {
    const fechaInicio = format(inicio, "yyyy-MM-dd'T'HH:mm:ss");

    // Obtener el nombre de usuario desde localStorage, siguiendo la lógica de usuario.service.ts
    const usuarioData = localStorage.getItem('usuarioActual');
    if (!usuarioData) {
      throw new Error('No se encontró información del usuario en el localStorage.');
    }
    const sesion = JSON.parse(usuarioData);
    const nombreUsuario = sesion.nombre;

    let params = new HttpParams()
      .set('inicio', fechaInicio)
      .set('usuario', nombreUsuario);

    if (fin) {
      const fechaFInal = format(fin, "yyyy-MM-dd'T'HH:mm:ss");
      params = params.set('fin', fechaFInal);
    }

    return this.http.post<TicketCierreTurno>(this.apiUrl, null, { params });
  }

  /**
   * Obtiene todos los cierres de turno guardados.
   * @returns Un Observable con un array de CierreTurno.
   */
  obtenerTodosLosCierres(): Observable<CierreTurno[]> {
    return this.http.get<CierreTurno[]>(this.apiUrl);
  }

  /**
   * Obtiene cierres de turno paginados.
   * @param page Número de página (0-indexed).
   * @param size Tamaño de la página.
   * @returns Un Observable con un objeto Page de CierreTurno.
   */
  obtenerCierresPaginados(page: number, size: number, inicio?: string, fin?: string): Observable<Page<CierreTurno>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (inicio) {
      params = params.set('inicio', inicio);
    }
    if (fin) {
      params = params.set('fin', fin);
    }

    return this.http.get<Page<CierreTurno>>(this.apiUrl, { params });
  }

  /**
   * Obtiene un cierre de turno específico por su ID.
   * @param id El ID del cierre a buscar.
   * @returns Un Observable con el CierreTurno encontrado.
   */
  obtenerCierrePorId(id: number): Observable<CierreTurno> {
    return this.http.get<CierreTurno>(`${this.apiUrl}/${id}`);
  }
}
