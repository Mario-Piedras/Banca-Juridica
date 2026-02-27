import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

interface SolicitudBackend {
  id_solicitud: number;
  cedula: string;
  fecha: string;
  estado: string;
  producto: string;
  comentario_asesor?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: SolicitudBackend[];
}

@Injectable({
  providedIn: 'root'
})
export class ConsultarService {
  private apiUrl = `${environment.apiUrl}/asesor/solicitudes`;

  constructor(private http: HttpClient) { }

  buscarPorCedula(cedula: string): Observable<SolicitudBackend[]> {
    const url = `${this.apiUrl}/cedula/${cedula}`;
    
    return this.http.get<ApiResponse>(url).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 404) {
        errorMessage = 'No se encontraron solicitudes';
      } else if (error.status === 500) {
        errorMessage = 'Error en el servidor. Intente más tarde';
      } else if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor';
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Error en ConsultarService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}