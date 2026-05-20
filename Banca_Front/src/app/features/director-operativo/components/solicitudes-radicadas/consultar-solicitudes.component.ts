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
  cedulaNombre: string = '';
  solicitudes: SolicitudConsulta[] = [];
  cargando: boolean = false;
  error: string = '';
  busquedaRealizada: boolean = false;

  constructor(private consultarService: ConsultarService, private router: Router) {}

  ngOnInit(): void {
    // Por defecto, cargar todas las solicitudes pendientes
    this.cargarTodas();
  }

  private cargarTodas(): void {
    this.cargando = true;
    this.error = '';
    this.busquedaRealizada = true;

    this.consultarService.obtenerTodasSolicitudes().subscribe({
      next: (response) => {
        if (response.success) {
          const estadosPermitidos: Set<string> = new Set(['Pendiente']);
          this.solicitudes = (response.data || []).filter((s) => estadosPermitidos.has(s.estado));
        } else {
          this.error = response.message || 'Error al cargar las solicitudes';
          this.solicitudes = [];
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar solicitudes:', err);
        this.error = 'Error al conectar con el servidor';
        this.solicitudes = [];
        this.cargando = false;
      }
    });
  }


  buscarSolicitudes(): void {
    this.busquedaRealizada = true;
    this.error = '';

    const query = this.cedulaNombre.trim().toLowerCase();

    if (!query) {
      // Si no hay criterio, mostrar las de por defecto
      this.cargarTodas();
      return;
    }

    // Búsqueda en memoria sobre los datos cargados
    this.solicitudes = (this.solicitudes || []).filter((s) => {
      const cedula = (s.cedula || '').toLowerCase();
      const nombre = (s.nombre_completo || '').toLowerCase();
      return cedula.includes(query) || nombre.includes(query);
    });

    if (this.solicitudes.length === 0) {
      this.error = 'No se encontraron solicitudes con ese criterio';
    }
  }

  verDetalle(solicitud: SolicitudConsulta): void {
    // Navegar al componente de detalle con el ID de la solicitud
    this.router.navigate(['/director-operativo/solicitud', solicitud.id_solicitud]);
  }

  limpiarBusqueda(): void {
    this.cedulaNombre = '';
    this.error = '';
    this.busquedaRealizada = false;
    this.cargarTodas();
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