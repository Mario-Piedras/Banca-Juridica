import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';

export interface SolicitudJuridicaDetalle {
  id_solicitud: number;
  nit: string;
  razon_social: string;
  nombre_corto?: string | null;

  fecha_constitucion: string;
  ciudad_constitucion: string;
  pais_constitucion: string;

  dir_sede_principal: string;
  barrio: string;
  ciudad_municipio: string;
  departamento: string;
  pais: string;

  telefono?: string | null;
  ext?: string | null;
  correo: string;
  comentario_asesor?: string;
}

export interface SolicitudJuridicaDetalleResponse {
  success: boolean;
  message: string;
  data: SolicitudJuridicaDetalle;
}

export interface AccionSolicitudResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})

export class SolicitudJuridicaService {
  private apiUrl = `${environment.apiUrl}/director`;

  constructor(private http: HttpClient) {}

  obtenerDetalleSolicitud(
    id_solicitud: number
  ): Observable<SolicitudJuridicaDetalleResponse> {
    return this.http.get<SolicitudJuridicaDetalleResponse>(
      `${this.apiUrl}/solicitudes-juridicas/${id_solicitud}`
    );
  }

  rechazarSolicitud(id_solicitud: number, motivo: string): Observable<AccionSolicitudResponse> {
    return this.http.put<AccionSolicitudResponse>(
      `${this.apiUrl}/solicitud/${id_solicitud}/rechazar`,
      { comentario: motivo }
    );
  }

  aprobarSolicitud(id_solicitud: number): Observable<AccionSolicitudResponse> {
    return this.http.put<AccionSolicitudResponse>(
      `${this.apiUrl}/solicitud/${id_solicitud}/aprobar`,
      {}
    );
  }

}