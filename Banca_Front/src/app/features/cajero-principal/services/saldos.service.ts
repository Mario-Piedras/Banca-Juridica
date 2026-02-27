// saldos-cajeros.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SaldosCajerosResponse {
  success: boolean;
  saldoBoveda: number;
  saldoOficina: number;
  cajeros: CajeroDetalle[];
  message?: string;
}

export interface CajeroDetalle {
  id_caja: number;
  nombre_caja: string;
  nombreCajero: string;
  saldoEfectivo: number;
  transaccionesHoy: number;
  dineroDepositado: number;
  dineroRetirado: number;
  cuentasAperturadas: number;
  estado: 'Activo' | 'Inactivo';
}

@Injectable({
  providedIn: 'root'
})
export class SaldosCajerosService {
  private apiUrl = `${environment.apiUrl}/saldos`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener saldos de todas las CAJAS
   */
  obtenerSaldosCajeros(): Observable<SaldosCajerosResponse> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<SaldosCajerosResponse>(`${this.apiUrl}/cajeros`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error obteniendo saldos de cajeros:', error);
          return of({
            success: false,
            saldoBoveda: 0,
            saldoOficina: 0,
            cajeros: [],
            message: 'Error al cargar los saldos de cajeros'
          });
        })
      );
  }

  /**
   * Obtener movimientos de una caja específica
   */
  obtenerMovimientosCaja(idCaja: number, fecha?: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let url = `${this.apiUrl}/caja/${idCaja}/movimientos`;
    if (fecha) {
      url += `?fecha=${fecha}`;
    }

    return this.http.get<any>(url, { headers })
      .pipe(
        catchError(error => {
          console.error('Error obteniendo movimientos de caja:', error);
          return of({
            success: false,
            movimientos: [],
            message: 'Error al cargar los movimientos'
          });
        })
      );
  }

  /**
   * Obtener resumen general del día
   */
  obtenerResumenDia(): Observable<{
    success: boolean;
    resumen: {
      totalDepositos: number;
      totalRetiros: number;
      totalTransacciones: number;
      cuentasAperturadas: number;
      saldoTotalCajas: number;
    };
    message?: string;
  }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<{
      success: boolean;
      resumen: any;
      message?: string;
    }>(`${this.apiUrl}/resumen-dia`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error obteniendo resumen del día:', error);
          return of({
            success: false,
            resumen: {
              totalDepositos: 0,
              totalRetiros: 0,
              totalTransacciones: 0,
              cuentasAperturadas: 0,
              saldoTotalCajas: 0
            },
            message: 'Error al cargar el resumen del día'
          });
        })
      );
  }
}