import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {SolicitudJuridicaService, SolicitudJuridicaDetalle,
  SolicitudJuridicaDetalleResponse, AccionSolicitudResponse
} from './services/solicitud-juridica.service';

@Component({
  selector: 'app-solicitud-juridica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitud-juridica.component.html',
  styleUrls: ['./solicitud-juridica.component.css']
})
export class SolicitudJuridicaComponent  implements OnInit {
  solicitud?: SolicitudJuridicaDetalle;
  
  mostrarModalRechazo: boolean = false;
  mostrarModalAprobacion: boolean = false;
  motivoRechazo: string = '';
  
  cargando: boolean = false;
  error: string = '';
  procesando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitudService: SolicitudJuridicaService
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
    this.solicitudService.obtenerDetalleSolicitud(id).subscribe({
      next: (resp: SolicitudJuridicaDetalleResponse) => {
        console.log('RESPUESTA:', resp);
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
    this.router.navigate(['/director-operativo/consultar-solicitudes-juridicas']);
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

}