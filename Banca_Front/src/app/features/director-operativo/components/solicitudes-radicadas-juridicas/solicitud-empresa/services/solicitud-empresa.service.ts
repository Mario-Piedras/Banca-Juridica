import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';

export interface ClienteInfo {
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  numero_documento: string;
  tipo_documento: string;
  fecha_nacimiento: string;
  nacionalidad: string;
  genero: string;
  estado_civil: string;
}

export interface ContactoInfo {
  correo?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
}

export interface ActividadEconomicaInfo {
  ocupacion?: string;
  profesion?: string;
}

export interface SolicitudDetalleCompleta {
  id_solicitud: number;
  id_cliente: number;
  id_asesor: number;
  tipo_cuenta: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Devuelta';
  comentario_director?: string;
  comentario_asesor?: string;
  fecha_solicitud: string;
  fecha_respuesta?: string;
  tiene_archivo: boolean;
  cliente: ClienteInfo;
  contacto: ContactoInfo;
  actividad_economica: ActividadEconomicaInfo;
}

export interface SolicitudDetalleResponse {
  success: boolean;
  message: string;
  data: SolicitudDetalleCompleta;
}

export interface AccionSolicitudRequest {
  comentario?: string;
}

export interface AccionSolicitudResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudClienteService {
  private apiUrl = `${environment.apiUrl}/director`;

  constructor(private http: HttpClient) {}

  obtenerDetalleCompleto(id_solicitud: number): Observable<SolicitudDetalleResponse> {
    return this.http.get<SolicitudDetalleResponse>(`${this.apiUrl}/solicitud-detalle/${id_solicitud}`);
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

  descargarArchivo(id_solicitud: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/solicitud/${id_solicitud}/archivo`, {
      responseType: 'blob'
    });
  }
}