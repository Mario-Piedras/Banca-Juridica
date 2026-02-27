import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SaldoCajeroService {
  private apiUrl = `${environment.apiUrl}/cajero`;

  constructor(private http: HttpClient) { }

  obtenerSaldos(id_usuario: number): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/saldo/consultar`, {
      params: { id_usuario: id_usuario.toString() }, // CAMBIAR cajero por id_usuario
      headers: headers
    });
  }
}
