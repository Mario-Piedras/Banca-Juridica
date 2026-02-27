import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service'; // ← NUEVO: Importar AuthService
import { environment } from '../../../../environments/environment';

export interface AplicarNotaDebitoRequest {
  idCuenta: number;
  numeroDocumento: string;
  valor: number;
  concepto?: string;
  idUsuario?: number;      // ← NUEVO: id_usuario
  idCaja?: number;         // ← NUEVO: id_caja
  nombreCaja?: string;     // ← NUEVO: nombre_caja
}

export interface AplicarNotaDebitoResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTransaccion: number;
    saldoAnterior: number;
    saldoNuevo: number;
    valor: number;
    fechaTransaccion: Date;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotaDebitoService {
  private apiUrl = `${environment.apiUrl}/cajero/nota-debito`;

  constructor(
    private http: HttpClient,
    private authService: AuthService  // ← NUEVO: Inyectar AuthService
  ) {}

  aplicarNotaDebito(datos: AplicarNotaDebitoRequest): Observable<AplicarNotaDebitoResponse> {
    // ✅ CORREGIDO: Inyectar automáticamente datos de auditoría
    const currentUser = this.authService.currentUserValue;
    
    const datosConAuditoria = {
      ...datos,
      idUsuario: currentUser?.id_usuario,    // ← NUEVO: id_usuario
      idCaja: currentUser?.id_caja,          // ← NUEVO: id_caja
      nombreCaja: currentUser?.nombre_caja   // ← NUEVO: nombre_caja
    };

    console.log('🔍 Nota débito con auditoría:', datosConAuditoria);

    return this.http.post<AplicarNotaDebitoResponse>(
      `${this.apiUrl}/aplicar-nota-debito`,
      datosConAuditoria
    );
  }
}
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// export interface AplicarNotaDebitoRequest {
//   idCuenta: number;
//   numeroDocumento: string;
//   valor: number;
// }

// export interface AplicarNotaDebitoResponse {
//   exito: boolean;
//   mensaje: string;
//   datos?: {
//     idTransaccion: number;
//     saldoAnterior: number;
//     saldoNuevo: number;
//     valor: number;
//     fechaTransaccion: Date;
//   };
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class NotaDebitoService {
//   private apiUrl = 'http://localhost:3000/api/cajero/nota-debito';

//   constructor(private http: HttpClient) {}

//   aplicarNotaDebito(datos: AplicarNotaDebitoRequest): Observable<AplicarNotaDebitoResponse> {
//     return this.http.post<AplicarNotaDebitoResponse>(
//       `${this.apiUrl}/aplicar-nota-debito`,
//       datos
//     );
//   }
// }
