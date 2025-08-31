// usuario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';
import { TicketCierreTurno } from '../models/cierreTurno';
import { tap } from 'rxjs/operators';
import { format } from 'date-fns';


@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  private usuarioActualSubject = new BehaviorSubject<Usuario | null>(null);
  usuarioActual$ = this.usuarioActualSubject.asObservable();

  constructor(private http: HttpClient) {
    // Restaurar sesión si hay usuario guardado
    const savedUser = localStorage.getItem('usuarioActual');
    if (savedUser) {
      const usuario: Usuario = JSON.parse(savedUser);
      usuario.fechaInicioSesion = new Date(usuario.fechaInicioSesion);
      this.usuarioActualSubject.next(usuario);
    }
  }

  // CRUD
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  createUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  updateUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Turno (login/cierre)
  login(nombre: string, cedula: string): Observable<Usuario | null> {
    return this.http
      .post<Usuario>(`${this.apiUrl}/login`, { nombre, cedula })
      .pipe(
        tap((usuario) => {
          if (usuario) {
            usuario.fechaInicioSesion = new Date(usuario.fechaInicioSesion);
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
            this.usuarioActualSubject.next(usuario);
          }
        })
      );
  }

  // cerrar sesión
  logout(): void {
    localStorage.removeItem('usuarioActual');
    this.usuarioActualSubject.next(null);
  }

  // obtener usuario actual
  getUsuarioActual(): Usuario | null {
    return this.usuarioActualSubject.value;
  }

  isLoggedIn(): boolean {
    return this.getUsuarioActual() !== null;
  }
}
