import { Component } from '@angular/core';
import { ConsultarService } from '../../services/consultar.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Solicitud {
  id: number;
  cedula: string;
  fecha: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  producto: string;
  comentario?: string;
}

@Component({
  selector: 'app-solicitudes-radicadas',
  templateUrl: './solicitudes-radicadas.component.html',
  imports: [FormsModule, CommonModule]
})
export class SolicitudesRadicadasComponent {
  tipoCliente: '' | 'Persona Natural' | 'Persona Juridica' = '';
  identificacion: string = '';
  solicitudes: Solicitud[] = [];
  mostrarModal: boolean = false;
  comentarioActual: string = '';
  cargando: boolean = false;
  mensajeError: string = '';

  constructor(private consultarService: ConsultarService) { }

  get etiquetaDocumento(): string {
    return this.tipoCliente === 'Persona Juridica' ? 'NIT de la empresa' : 'Cédula del cliente';
  }

  get placeholderDocumento(): string {
    return this.tipoCliente === 'Persona Juridica' ? 'Ej: 900123456' : 'Ej: 0000001';
  }

  get ayudaDocumento(): string {
    if (this.tipoCliente === 'Persona Juridica') {
      return 'Ingresa el NIT de la empresa para consultar sus solicitudes radicadas.';
    }

    return 'Ingresa la cédula del cliente para consultar sus solicitudes radicadas.';
  }

  get columnaDocumento(): string {
    return this.tipoCliente === 'Persona Juridica' ? 'NIT' : 'Cédula';
  }

  get puedeBuscar(): boolean {
    return this.tipoCliente !== '' && this.identificacion.trim().length > 0;
  }

  onTipoClienteChange(): void {
    this.identificacion = '';
    this.solicitudes = [];
    this.mensajeError = '';
    this.cargando = false;
  }

  limpiarBusqueda(): void {
    this.tipoCliente = '';
    this.identificacion = '';
    this.solicitudes = [];
    this.mensajeError = '';
    this.cargando = false;
  }

  buscarSolicitudes(): void {
    if (!this.tipoCliente) {
      this.mensajeError = 'Por favor seleccione el tipo de cliente';
      return;
    }

    if (!this.identificacion.trim()) {
      this.mensajeError =
        this.tipoCliente === 'Persona Juridica'
          ? 'Por favor ingrese el NIT de la empresa'
          : 'Por favor ingrese la cédula del cliente';
      return;
    }

    if (this.tipoCliente === 'Persona Juridica') {
      this.mensajeError =
        'La búsqueda por NIT requiere que el backend exponga el endpoint correspondiente. Mientras tanto, la vista está preparada para el selector y el campo de NIT.';
      this.solicitudes = [];
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.solicitudes = [];

    this.consultarService.buscarPorCedula(this.identificacion).subscribe({
      next: (data) => {
        this.solicitudes = data.map((item) => ({
          id: item.id_solicitud,
          cedula: item.cedula,
          fecha: this.formatearFecha(item.fecha),
          estado: this.mapearEstado(item.estado),
          producto: item.producto,
          comentario: item.comentario_asesor || ''
        }));

        this.cargando = false;

        if (this.solicitudes.length === 0) {
          this.mensajeError = 'No se encontraron solicitudes para esta cédula';
        }
      },
      error: () => {
        this.mensajeError = 'Error al buscar las solicitudes. Intente nuevamente.';
        this.cargando = false;
      }
    });
  }

  verComentario(solicitud: Solicitud): void {
    this.comentarioActual = solicitud.comentario || 'No hay comentario disponible para esta solicitud.';
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.comentarioActual = '';
  }

  cerrarModalFondo(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cerrarModal();
    }
  }

  private formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private mapearEstado(estado: string): 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' {
    const estadoUpper = estado.toUpperCase();
    if (estadoUpper === 'PENDIENTE') return 'PENDIENTE';
    if (estadoUpper === 'APROBADA' || estadoUpper === 'APROBADO') return 'APROBADO';
    if (estadoUpper === 'RECHAZADA' || estadoUpper === 'RECHAZADO') return 'RECHAZADO';
    return 'PENDIENTE';
  }

  soloNumeros(event: KeyboardEvent): void {
    const pattern = /^[0-9]$/;
    const inputChar = event.key;
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}