// ============================
// archivo: vehiculo.service.ts
// ============================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Vehiculo } from '../models/vehiculo';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {

  private apiUrl = `${environment.apiUrl}/vehiculos`;

  constructor(private http: HttpClient) {}

  // ===============================
  // 1. Obtener todos los vehículos
  // ===============================
  getVehiculos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.apiUrl);
  }

  // ===============================
  // 2. Obtener un vehículo por ID
  // ===============================
  getVehiculoById(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.apiUrl}/${id}`);
  }

  // ===============================
  // 3. Crear un nuevo vehículo
  // ===============================
  createVehiculo(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.apiUrl, vehiculo);
  }

  // ===============================
  // 4. Actualizar un vehículo por ID
  // ===============================
  updateVehiculo(id: number, vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.apiUrl}/${id}`, vehiculo);
  }

  // ===============================
  // 5. Eliminar un vehículo por ID
  // ===============================
  deleteVehiculo(id: number): Observable<Vehiculo> {
    return this.http.delete<Vehiculo>(`${this.apiUrl}/${id}`);
  }
}
