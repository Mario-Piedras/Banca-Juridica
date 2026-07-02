import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudClienteService, SolicitudDetalleCompleta, SolicitudDetalleResponse, AccionSolicitudResponse } from './services/solicitud.service';
import { ConfirmModalComponent, ConfirmModalType } from '../../../../../shared/components/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-solicitud-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './solicitud-cliente.component.html',
  styleUrls: ['./solicitud-cliente.component.css']
})
export class SolicitudClienteComponent implements OnInit {
  solicitud?: SolicitudDetalleCompleta;

  mostrarModalRechazo: boolean = false;
  mostrarModalAprobacion: boolean = false;
  motivoRechazo: string = '';

  cargando: boolean = false;
  error: string = '';
  procesando: boolean = false;

  // Modal de mensajes
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: ConfirmModalType = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitudService: SolicitudClienteService
  ) { }

  ngOnInit(): void {
    this.cargarSolicitud();
  }

  private cargarSolicitud(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.error = 'ID de solicitud no proporcionado';
      return;
    }

    const id = Number(idParam);
    if (isNaN(id)) {
      this.error = 'ID de solicitud inválido';
      return;
    }

    this.cargando = true;
    this.solicitudService.obtenerDetalleCompleto(id).subscribe({
      next: (resp: SolicitudDetalleResponse) => {
        if (resp.success) {
          this.solicitud = resp.data;
        } else {
          this.error = resp.message || 'No fue posible cargar la solicitud';
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error detalle solicitud', err);
        this.error = 'Error al conectar con el servidor';
        this.cargando = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/director-operativo/consultar-solicitudes']);
  }

  modalAction: (() => void) | null = null;
  mostrarModal(
    type: ConfirmModalType,
    title: string,
    message: string,
    action?: () => void
  ): void {

    // Cerrar los modales propios del formulario
    this.mostrarModalRechazo = false;
    this.mostrarModalAprobacion = false;

    this.modalType = type;
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalVisible = true;
    this.modalAction = action || null;
  }

  onConfirmModal(): void {
    if (this.modalAction) {
      this.modalAction();
      this.modalAction = null;
    }
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.modalAction = null;
  }

  abrirModalRechazo(): void {
    this.mostrarModalRechazo = true;
    this.motivoRechazo = '';
  }

  cerrarModalRechazo(): void {
    this.mostrarModalRechazo = false;
    this.motivoRechazo = '';
  }

  confirmarRechazo(): void {
    if (!this.motivoRechazo.trim()) {
      this.mostrarModal(
        'error',
        'Error',
        'Por favor ingrese el motivo del rechazo.'
      );
      return;
    }

    if (!this.solicitud) return;

    this.procesando = true;
    this.solicitudService.rechazarSolicitud(this.solicitud.id_solicitud, this.motivoRechazo).subscribe({
      next: (resp: AccionSolicitudResponse) => {
        if (resp.success) {
          this.mostrarModalRechazo = false;
          this.mostrarModal(
            'success',
            'Solicitud rechazada',
            'La solicitud fue rechazada exitosamente.',
            () => this.volver()
          );
        } else {
          this.mostrarModal(
            'error',
            'Error',
            resp.message || 'Error al rechazar la solicitud.'
          );
        }
        this.procesando = false;
      },
      error: (err: any) => {
        console.error('Error al rechazar solicitud:', err);
        this.mostrarModal(
          'error',
          'Error',
          'Error al conectar con el servidor.'
        );
        this.procesando = false;
      }
    });
  }

  abrirModalAprobacion(): void {
    this.mostrarModalAprobacion = true;
  }

  cerrarModalAprobacion(): void {
    this.mostrarModalAprobacion = false;
  }

  confirmarAprobacion(): void {
    if (!this.solicitud) return;

    this.procesando = true;
    this.solicitudService.aprobarSolicitud(this.solicitud.id_solicitud).subscribe({
      next: (resp: AccionSolicitudResponse) => {
        if (resp.success) {
          this.mostrarModalAprobacion = false;
          this.mostrarModal(
            'success',
            'Solicitud aprobada',
            'La solicitud fue aprobada exitosamente.',
            () => this.volver()
          );
        } else {
          this.mostrarModal(
            'error',
            'Error',
            resp.message || 'Error al aprobar la solicitud.'
          );
        }
        this.procesando = false;
      },
      error: (err: any) => {
        console.error('Error al aprobar solicitud:', err);
        this.mostrarModal(
          'error',
          'Error',
          'Error al conectar con el servidor.'
        );
        this.procesando = false;
      }
    });
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  obtenerAnioNacimiento(fechaNacimiento: string): string {
    if (!fechaNacimiento) return '--';
    const fecha = new Date(fechaNacimiento);
    return fecha.getFullYear().toString();
  }

  descargarArchivo(): void {
    if (!this.solicitud) return;

    this.solicitudService.descargarArchivo(this.solicitud.id_solicitud).subscribe({
      next: (response: Blob) => {
        // Detectar tipo de archivo por content-type o extensión
        const contentType = response.type;
        let extension = 'pdf';

        // Mapeo de content-type a extensión
        if (contentType.includes('png')) {
          extension = 'png';
        } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
          extension = 'jpg';
        } else if (contentType.includes('msword') && !contentType.includes('openxmlformats')) {
          extension = 'doc';
        } else if (contentType.includes('wordprocessingml')) {
          extension = 'docx';
        } else if (contentType.includes('pdf')) {
          extension = 'pdf';
        }

        // Crear blob con el tipo correcto
        const blob = new Blob([response], { type: contentType });

        // Crear URL temporal
        const url = window.URL.createObjectURL(blob);

        // Crear elemento <a> para descargar
        const link = document.createElement('a');
        link.href = url;
        link.download = `solicitud_${this.solicitud!.id_solicitud}_archivo.${extension}`;

        // Simular click
        document.body.appendChild(link);
        link.click();

        // Limpiar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Error al descargar archivo:', err);
        if (err.status === 404) {
          this.mostrarModal(
            'error',
            'Archivo no disponible',
            'No hay archivo adjunto en esta solicitud.'
          );
        } else {
          this.mostrarModal(
            'error',
            'Error',
            'Error al descargar el archivo.'
          );
        }
      }
    });
  }

  tieneArchivo(): boolean {
    return this.solicitud?.tiene_archivo || false;
  }

}