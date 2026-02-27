import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Servicio centralizado para configuración de URLs y constantes
 * Este servicio evita hardcodear URLs en múltiples servicios
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly baseApiUrl = environment.apiUrl;

  constructor() {}

  /**
   * URLs de los módulos del backend
   */
  get apiUrls() {
    return {
      auth: `${this.baseApiUrl}/auth`,
      asesor: `${this.baseApiUrl}/asesor`,
      cajero: `${this.baseApiUrl}/cajero`,
      saldos: `${this.baseApiUrl}/saldos`,
      director: `${this.baseApiUrl}/director`
    };
  }

  /**
   * Endpoints específicos del módulo cajero
   */
  get cajeroEndpoints() {
    return {
      apertura: `${this.apiUrls.cajero}/apertura`,
      retiro: `${this.apiUrls.cajero}/retiro`,
      consignacion: `${this.apiUrls.cajero}/consignacion`,
      cancelacion: `${this.apiUrls.cajero}/cancelacion`,
      notaDebito: `${this.apiUrls.cajero}/nota-debito`,
      traslado: `${this.apiUrls.cajero}/traslado`
    };
  }

  /**
   * Endpoints del módulo asesor
   */
  get asesorEndpoints() {
    return {
      solicitudes: `${this.apiUrls.asesor}/solicitudes`,
      registrarCliente: `${this.apiUrls.asesor}/registrar-cliente`,
      consultarCliente: `${this.apiUrls.asesor}/cliente`
    };
  }

  /**
   * Endpoints del módulo saldos (cajero principal)
   */
  get saldosEndpoints() {
    return {
      cajeros: `${this.apiUrls.saldos}/cajeros`,
      oficina: `${this.apiUrls.saldos}/oficina`,
      boveda: `${this.apiUrls.saldos}/boveda`,
      movimientos: `${this.apiUrls.saldos}/caja`
    };
  }

  /**
   * Endpoints del módulo director
   */
  get directorEndpoints() {
    return {
      solicitudes: `${this.apiUrls.director}/solicitudes`
    };
  }
}
