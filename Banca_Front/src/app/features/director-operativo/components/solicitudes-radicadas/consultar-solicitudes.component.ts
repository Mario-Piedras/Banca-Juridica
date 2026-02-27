import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultarService, SolicitudConsulta } from '../../services/consultar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consultar-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultar-solicitudes.component.html',
  styleUrls: ['./consultar-solicitudes.component.css']
})
export class ConsultarSolicitudesComponent implements OnInit {
  asesorId: string = '';
  solicitudes: SolicitudConsulta[] = [];
  cargando: boolean = false;
  error: string = '';
  busquedaRealizada: boolean = false;

  constructor(private consultarService: ConsultarService, private router: Router) {}

  ngOnInit(): void {
    // Inicialización
  }

  buscarSolicitudes(): void {
    if (!this.asesorId.trim()) {
      this.error = 'Por favor ingrese el ID del asesor';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.busquedaRealizada = true;

    // Simular tiempo de carga de 1 segundo
    setTimeout(() => {
      this.consultarService.buscarPorAsesor(this.asesorId.trim()).subscribe({
        next: (response) => {
          if (response.success) {
            this.solicitudes = response.data;
            if (this.solicitudes.length === 0) {
              this.error = 'No se encontraron solicitudes para este asesor';
            }
          } else {
            this.error = response.message || 'Error al buscar las solicitudes';
            this.solicitudes = [];
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al buscar solicitudes:', err);
          this.error = 'Error al conectar con el servidor. Verifique que el ID sea correcto.';
          this.solicitudes = [];
          this.cargando = false;
        }
      });
    }, 500);
  }

  verDetalle(solicitud: SolicitudConsulta): void {
    // Navegar al componente de detalle con el ID de la solicitud
    this.router.navigate(['/director-operativo/solicitud', solicitud.id_solicitud]);
  }

  limpiarBusqueda(): void {
    this.asesorId = '';
    this.solicitudes = [];
    this.error = '';
    this.busquedaRealizada = false;
  }

  obtenerClaseEstado(estado: string): string {
    const clases: { [key: string]: string } = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Aprobada': 'bg-green-100 text-green-800',
      'Rechazada': 'bg-red-100 text-red-800',
      'Devuelta': 'bg-blue-100 text-blue-800'
    };
    return clases[estado] || 'bg-gray-100 text-gray-800';
  }
}