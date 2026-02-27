import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsesorService {
  private apiUrl = `${environment.apiUrl}`; // Base URL del backend

  // 🧠 Estado temporal del cliente (vive en memoria)
  private clienteDataSubject = new BehaviorSubject<any>({
    datosPersonales: null,
    contacto: null,
    actividad: null,
    laboral: null,
    financiera: null,
    facta: null,
  });

  constructor(private http: HttpClient) {}

  /** ================================
   * 🔹 Sincronización local de datos
   * ================================ */

  // ✅ Guarda o actualiza los datos locales del cliente
  setClienteData(data: any) {
    this.clienteDataSubject.next({
      ...this.clienteDataSubject.value,
      ...data
    });
    console.log('📦 Datos del cliente actualizados en AsesorService:', this.clienteDataSubject.value);
  }

  // ✅ Retorna los datos locales del cliente (una sola lectura)
  getClienteData(): any {
    return this.clienteDataSubject.value;
  }

  // ✅ Retorna los datos como Observable (para suscribirse y reaccionar a cambios)
  clienteData$(): Observable<any> {
    return this.clienteDataSubject.asObservable();
  }

  /** ================================
   * 🔹 Peticiones al backend
   * ================================ */

  // Buscar cliente por documento
  buscarCliente(numeroDocumento: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/asesor/cliente/${numeroDocumento}`);
  }

  // Registrar cliente nuevo
  registrarCliente(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/asesor/registrar-cliente`, payload);
  }
  // 🔹 Obtener cliente completo por ID (para edición)
  obtenerClientePorId(idCliente: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/asesor/cliente-id/${idCliente}`);
  }

  // 🔹 Actualizar cliente existente
  actualizarCliente(idCliente: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/asesor/actualizar-cliente/${idCliente}`, payload);
  }

  // 🔹 Obtener solo los datos básicos (para mostrar en búsqueda)
  obtenerClienteBasico(idCliente: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/asesor/cliente-basico/${idCliente}`);
  }
}
