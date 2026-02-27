import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service'; // ← NUEVO: Importar AuthService
import { environment } from '../../../../environments/environment';

export interface EnviarTrasladoRequest {
  cajeroOrigen: string;
  cajeroDestino: string;
  monto: number;
  idUsuario?: number;      // ← NUEVO: id_usuario
  idCaja?: number;         // ← NUEVO: id_caja
  nombreCaja?: string;     // ← NUEVO: nombre_caja
}

export interface EnviarTrasladoResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTraslado: number;
    cajeroOrigen: string;
    cajeroDestino: string;
    monto: number;
    fechaEnvio: Date;
  };
}

export interface TrasladoPendiente {
  idTraslado: number;
  cajeroOrigen: string;
  monto: number;
  fechaEnvio: Date;
  idUsuarioOrigen?: number;    // ← NUEVO
  idCajaOrigen?: number;       // ← NUEVO
  nombreCajaOrigen?: string;   // ← NUEVO
}

export interface ConsultarTrasladosResponse {
  exito: boolean;
  traslados: TrasladoPendiente[];
}

export interface AceptarTrasladoRequest {
  idTraslado: number;
  cajeroDestino: string;
  idUsuario?: number;      // ← NUEVO: id_usuario
  idCaja?: number;         // ← NUEVO: id_caja
  nombreCaja?: string;     // ← NUEVO: nombre_caja
}

export interface AceptarTrasladoResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTraslado: number;
    cajeroOrigen: string;
    cajeroDestino: string;
    monto: number;
    fechaEnvio: Date;
    fechaAceptacion: Date;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TrasladoService {
  private apiUrl = `${environment.apiUrl}/cajero/traslado`;

  constructor(
    private http: HttpClient,
    private authService: AuthService  // ← NUEVO: Inyectar AuthService
  ) {}

  enviarTraslado(datos: EnviarTrasladoRequest): Observable<EnviarTrasladoResponse> {
    // ✅ CORREGIDO: Inyectar automáticamente datos de auditoría
    const currentUser = this.authService.currentUserValue;
    
    const datosConAuditoria = {
      ...datos,
      idUsuario: currentUser?.id_usuario,    // ← NUEVO: id_usuario
      idCaja: currentUser?.id_caja,          // ← NUEVO: id_caja
      nombreCaja: currentUser?.nombre_caja   // ← NUEVO: nombre_caja
    };

    console.log('🔍 Enviar traslado con auditoría:', datosConAuditoria);

    return this.http.post<EnviarTrasladoResponse>(`${this.apiUrl}/enviar`, datosConAuditoria);
  }

  consultarTrasladosPendientes(cajeroDestino: string): Observable<ConsultarTrasladosResponse> {
    return this.http.get<ConsultarTrasladosResponse>(
      `${this.apiUrl}/consultar-pendientes?cajeroDestino=${cajeroDestino}`
    );
  }

  aceptarTraslado(datos: AceptarTrasladoRequest): Observable<AceptarTrasladoResponse> {
    // ✅ CORREGIDO: Inyectar automáticamente datos de auditoría
    const currentUser = this.authService.currentUserValue;
    
    const datosConAuditoria = {
      ...datos,
      idUsuario: currentUser?.id_usuario,    // ← NUEVO: id_usuario
      idCaja: currentUser?.id_caja,          // ← NUEVO: id_caja
      nombreCaja: currentUser?.nombre_caja   // ← NUEVO: nombre_caja
    };

    console.log('🔍 Aceptar traslado con auditoría:', datosConAuditoria);

    return this.http.post<AceptarTrasladoResponse>(`${this.apiUrl}/aceptar`, datosConAuditoria);
  }
}
