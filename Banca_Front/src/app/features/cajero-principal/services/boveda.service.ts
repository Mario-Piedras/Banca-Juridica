import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SaldoBovedaResponse {
  success: boolean;
  saldo: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BovedaService {
  private apiUrl = `${environment.apiUrl}/saldos`; // Misma base que saldos

  constructor(private http: HttpClient) {}

  /**
   * Obtener saldo de bóveda específico
   */
  obtenerSaldoBoveda(): Observable<SaldoBovedaResponse> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<SaldoBovedaResponse>(`${this.apiUrl}/boveda/saldo`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error obteniendo saldo de bóveda:', error);
          return of({
            success: false,
            saldo: 0,
            message: 'Error al cargar el saldo de bóveda'
          });
        })
      );
  }
}