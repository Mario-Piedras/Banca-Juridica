import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MovimientosCuentaService {
    private api =
        `${environment.apiUrl}/asesor/movimientos`;
    constructor(
        private http: HttpClient
    ) { }

    buscarCuenta(
        numeroCuenta: string
    ) {

        return this.http.get<any>(
            `${this.api}/cuenta/${numeroCuenta}`
        );

    }

    consultarMovimientos(
        numeroCuenta: string
    ) {
        return this.http.get<any>(
            `${this.api}/${numeroCuenta}`
        );
    }
}