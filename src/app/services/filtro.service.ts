import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FiltrosDTO } from '../models/filtros';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FiltroService {
  private apiUrl = `${environment.apiUrl}/filtros`;

  constructor(private http: HttpClient) { }

  getFiltros(): Observable<FiltrosDTO> {
    return this.http.get<FiltrosDTO>(this.apiUrl);
  }
}
