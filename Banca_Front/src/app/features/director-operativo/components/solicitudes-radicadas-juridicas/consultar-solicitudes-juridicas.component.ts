import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ConsultarService,
  SolicitudJuridicaConsulta
} from '../../services/consultar.service';

@Component({
  selector: 'app-consultar-solicitudes-juridicas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultar-solicitudes-juridicas.component.html',
  styleUrls: ['./consultar-solicitudes-juridicas.component.css']
})
export class ConsultarSolicitudesJuridicasComponent implements OnInit {

  nitRazonSocial: string = '';
  solicitudes: SolicitudJuridicaConsulta[] = [];

  cargando: boolean = false;
  error: string = '';
  busquedaRealizada: boolean = false;

  constructor(private consultarService: ConsultarService) {}

  ngOnInit(): void {
    this.cargarTodas();
  }

  private cargarTodas(): void {

    this.cargando = true;
    this.error = '';
    this.busquedaRealizada = true;

    this.consultarService.obtenerSolicitudesJuridicas().subscribe({

      next: (response) => {

        if (response.success) {

          const estadosPermitidos: Set<string> = new Set(['Pendiente']);

          this.solicitudes = (response.data || []).filter(
            (s) => estadosPermitidos.has(s.estado)
          );

        } else {

          this.error = response.message;
          this.solicitudes = [];

        }

        this.cargando = false;
      },

      error: (err) => {

        console.error(err);

        this.error = 'Error al conectar con el servidor';
        this.solicitudes = [];

        this.cargando = false;
      }
    });
  }

  buscarSolicitudes(): void {

    this.busquedaRealizada = true;
    this.error = '';

    const query = this.nitRazonSocial.trim().toLowerCase();

    if (!query) {
      this.cargarTodas();
      return;
    }

    this.solicitudes = this.solicitudes.filter((s) => {

      const nit = (s.nit || '').toLowerCase();
      const razon = (s.razon_social || '').toLowerCase();

      return nit.includes(query) || razon.includes(query);

    });

    if (this.solicitudes.length === 0) {
      this.error = 'No se encontraron solicitudes';
    }
  }

  limpiarBusqueda(): void {
    this.nitRazonSocial = '';
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