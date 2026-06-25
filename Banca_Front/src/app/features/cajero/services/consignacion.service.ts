import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

export interface ProcesarConsignacionRequest {
  numeroCuenta: string;
  tipoConsignacion: 'Efectivo' | 'Cheque';
  valor: number;
  codigoCheque?: string;
  numeroCheque?: string;
  idUsuario?: number; // ← NUEVO: Cajero que realiza
  idCaja?: number; // ← NUEVO: Caja asignada
}

export interface ProcesarConsignacionResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTransaccion: number;
    numeroCuenta: string;
    titular: string;
    numeroDocumento: string;
    tipoTitular?: 'Natural' | 'Juridica';
    saldoAnterior: number;
    saldoNuevo: number;
    valorConsignado: number;
    tipoConsignacion: string;
    codigoCheque?: string;
    numeroCheque?: string;
    fechaTransaccion: Date;
    idUsuario?: number; // ← NUEVO: Cajero que realiza
    idCaja?: number; // ← NUEVO: Caja asignada
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConsignacionService {
  private apiUrl = `${environment.apiUrl}/cajero/consignacion`;

  constructor(
    private http: HttpClient,
    private authService: AuthService // ← INYECTADO para obtener datos del cajero
  ) {}

  procesarConsignacion(
    datos: ProcesarConsignacionRequest
  ): Observable<ProcesarConsignacionResponse> {
    const currentUser = this.authService.currentUserValue;

    // ✅ AGREGAR AUTOMÁTICAMENTE CAJA Y USUARIO
    const datosConCaja = {
      ...datos,
      idUsuario: currentUser?.id_usuario,
      idCaja: currentUser?.id_caja,
    };

    console.log('📦 Consignación con caja:', datosConCaja);

    return this.http.post<ProcesarConsignacionResponse>(`${this.apiUrl}/procesar`, datosConCaja);
  }
}