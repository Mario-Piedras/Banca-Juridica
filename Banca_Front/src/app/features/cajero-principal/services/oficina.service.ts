import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SaldoOficinaResponse {
  success: boolean;
  saldoOficina: number;
  saldoBoveda: number;
  saldoVentanillas: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OficinaService {
  private apiUrl = `${environment.apiUrl}/saldos`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener saldo de oficina con desglose
   */
  obtenerSaldoOficina(): Observable<SaldoOficinaResponse> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<SaldoOficinaResponse>(`${this.apiUrl}/oficina/saldo`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error obteniendo saldo de oficina:', error);
          return of({
            success: false,
            saldoOficina: 0,
            saldoBoveda: 0,
            saldoVentanillas: 0,
            message: 'Error al cargar el saldo de oficina'
          });
        })
      );
  }
}