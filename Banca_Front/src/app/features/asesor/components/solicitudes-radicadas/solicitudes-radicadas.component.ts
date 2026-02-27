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
  cedula: string = '';
  solicitudes: Solicitud[] = [];
  mostrarModal: boolean = false;
  comentarioActual: string = '';
  cargando: boolean = false;
  mensajeError: string = '';

  constructor(private consultarService: ConsultarService) {}

  buscarSolicitudes(): void {
    if (!this.cedula || this.cedula.trim() === '') {
      this.mensajeError = 'Por favor ingrese un número de cédula';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.solicitudes = [];

    this.consultarService.buscarPorCedula(this.cedula).subscribe({
      next: (data) => {
        // Mapear la respuesta del backend al formato del frontend
        this.solicitudes = data.map(item => ({
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
      error: (error) => {
        console.error('Error al buscar solicitudes:', error);
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