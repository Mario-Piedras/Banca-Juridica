import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudClienteService, SolicitudDetalleCompleta, SolicitudDetalleResponse, AccionSolicitudResponse } from './services/solicitud.service';

@Component({
  selector: 'app-solicitud-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitudService: SolicitudClienteService
  ) {}

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
      alert('Por favor ingrese el motivo del rechazo');
      return;
    }

    if (!this.solicitud) return;

    this.procesando = true;
    this.solicitudService.rechazarSolicitud(this.solicitud.id_solicitud, this.motivoRechazo).subscribe({
      next: (resp: AccionSolicitudResponse) => {
        if (resp.success) {
          alert('Solicitud rechazada exitosamente');
          this.mostrarModalRechazo = false;
          this.volver();
        } else {
          alert(resp.message || 'Error al rechazar la solicitud');
        }
        this.procesando = false;
      },
      error: (err: any) => {
        console.error('Error al rechazar solicitud:', err);
        alert('Error al conectar con el servidor');
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
          alert('Solicitud aprobada exitosamente');
          this.mostrarModalAprobacion = false;
          this.volver();
        } else {
          alert(resp.message || 'Error al aprobar la solicitud');
        }
        this.procesando = false;
      },
      error: (err: any) => {
        console.error('Error al aprobar solicitud:', err);
        alert('Error al conectar con el servidor');
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
          alert('No hay archivo adjunto en esta solicitud');
        } else {
          alert('Error al descargar el archivo');
        }
      }
    });
  }

  tieneArchivo(): boolean {
    return this.solicitud?.tiene_archivo || false;
  }
}