import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SolicitudConsulta {
  id_solicitud: number;
  id_asesor: number;
  cedula: string;
  fecha: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Devuelta';
  producto: string;
  comentario_director?: string;
  comentario_asesor?: string;
  nombre_completo: string;
}

export interface ConsultarResponse {
  success: boolean;
  message: string;
  data: SolicitudConsulta[];
}

export interface DetalleResponse {
  success: boolean;
  message: string;
  data: SolicitudConsulta;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultarService {
  private apiUrl = `${environment.apiUrl}/director`;

  constructor(private http: HttpClient) {}

  buscarPorAsesor(id_usuario_rol: string): Observable<ConsultarResponse> {
    return this.http.get<ConsultarResponse>(`${this.apiUrl}/solicitudes/asesor/${id_usuario_rol}`);
  }

  obtenerDetalle(id_solicitud: number): Observable<DetalleResponse> {
    return this.http.get<DetalleResponse>(`${this.apiUrl}/solicitudes/${id_solicitud}`);
  }

  obtenerTodasSolicitudes(estado?: string): Observable<ConsultarResponse> {
    const url = estado 
      ? `${this.apiUrl}/solicitudes?estado=${estado}` 
      : `${this.apiUrl}/solicitudes`;
    return this.http.get<ConsultarResponse>(url);
  }
}