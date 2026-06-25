import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

export interface VerificarClienteRequest {
  tipoCliente: string;

  tipoDocumento?: string;
  numeroDocumento?: string;

  nit?: string;
}

export interface VerificarClienteResponse {
  existe: boolean;
  estado: string;
  mensaje: string;
  nombreCompleto?: string;
  idCliente?: number;
  idSolicitud?: number;
  icono?: string;
}

export interface AperturarCuentaRequest {
  tipoCliente: string;
  idSolicitud: number;
  tipoDeposito: string;
  valorDeposito: number;
  codigoCheque?: string;
  numeroCheque?: string;
  idUsuario?: number;    
  idCaja?: number;      
}

export interface AperturarCuentaResponse {
  exito: boolean;
  mensaje: string;
  numeroCuenta?: string;
  idCuenta?: number;
  idTransaccion?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AperturaService {
  private apiUrl = `${environment.apiUrl}/cajero/apertura`;

  constructor(
    private http: HttpClient,
    private authService: AuthService  // ← INYECTADO para obtener datos del cajero
  ) {}

  verificarCliente(datos: VerificarClienteRequest): Observable<VerificarClienteResponse> {
    return this.http.post<VerificarClienteResponse>(
      `${this.apiUrl}/verificar-cliente`,
      datos
    );
  }

  aperturarCuenta(datos: AperturarCuentaRequest): Observable<AperturarCuentaResponse> {
    const currentUser = this.authService.currentUserValue;
    
    // ✅ AGREGAR AUTOMÁTICAMENTE CAJA Y USUARIO
    const datosConCaja = {
      ...datos,
      idUsuario: currentUser?.id_usuario,
      idCaja: currentUser?.id_caja
    };

    console.log('📦 Apertura de cuenta con caja:', datosConCaja);
    
    return this.http.post<AperturarCuentaResponse>(
      `${this.apiUrl}/aperturar-cuenta`,
      datosConCaja
    );
  }
}
