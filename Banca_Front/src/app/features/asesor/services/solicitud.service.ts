import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private apiUrl = `${environment.apiUrl}/asesor`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Buscar cliente por cédula
   */
  buscarCliente(cedula: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes/${cedula}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  
  enviarSolicitud(solicitud: any): Observable<any> {
    const formData = new FormData();
    formData.append('cedula', solicitud.cedula);
    formData.append('producto', solicitud.producto);
    formData.append('comentario', solicitud.comentario || '');
    
    if (solicitud.archivo) {
      formData.append('archivo', solicitud.archivo, solicitud.archivo.name);
    }

    // Enviar con headers de autenticación
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/solicitudes`, formData, { headers });
  }

  /**
   * Obtener todas las solicitudes
   */
  obtenerSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/solicitudes`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Obtener solicitud por ID
   */
  obtenerSolicitudPorId(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/solicitudes/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Actualizar solicitud
   */
  actualizarSolicitud(id: string, solicitud: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/solicitudes/${id}`, solicitud, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Eliminar solicitud
   */
  eliminarSolicitud(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/solicitudes/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}