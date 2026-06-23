import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service'; // ← NUEVO: Importar AuthService
import { environment } from '../../../../environments/environment';

export interface BuscarCuentaRequest {
  numeroCuenta: string;
}

export interface BuscarCuentaResponse {
  existe: boolean;
  mensaje: string;
  datos?: {
    numeroCuenta: string;
    numeroDocumento: string;
    titular: string;
    saldo: number;
    estadoCuenta: string;
    idCuenta: number;
    idCliente: number;
  };
}

export interface ProcesarRetiroRequest {
  idCuenta: number;
  numeroDocumento: string;
  montoRetirar: number;
  idUsuario?: number;      // ← NUEVO: id_usuario
  idCaja?: number;         // ← NUEVO: id_caja
  nombreCaja?: string;     // ← NUEVO: nombre_caja
}

export interface ProcesarRetiroResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTransaccion: number;
    saldoAnterior: number;
    saldoNuevo: number;
    montoRetirado: number;
    fechaTransaccion: Date;
    nombreTitular?: string;
    numeroDocumento?: string;
    tipoCuenta?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RetiroService {
  private apiUrl = `${environment.apiUrl}/cajero/retiro`;

  constructor(
    private http: HttpClient,
    private authService: AuthService  // ← NUEVO: Inyectar AuthService
  ) {}

  buscarCuenta(datos: BuscarCuentaRequest): Observable<BuscarCuentaResponse> {
    return this.http.post<BuscarCuentaResponse>(
      `${this.apiUrl}/buscar-cuenta`,
      datos
    );
  }

  procesarRetiro(datos: ProcesarRetiroRequest): Observable<ProcesarRetiroResponse> {
    // ✅ CORREGIDO: Inyectar automáticamente datos de auditoría
    const currentUser = this.authService.currentUserValue;
    
    const datosConAuditoria = {
      ...datos,
      idUsuario: currentUser?.id_usuario,    // ← NUEVO: id_usuario
      idCaja: currentUser?.id_caja,          // ← NUEVO: id_caja
      nombreCaja: currentUser?.nombre_caja   // ← NUEVO: nombre_caja
    };

    console.log('🔍 Retiro con auditoría:', datosConAuditoria);

    return this.http.post<ProcesarRetiroResponse>(
      `${this.apiUrl}/procesar-retiro`,
      datosConAuditoria
    );
  }
}