// src/app/features/asesor/components/consultar-cliente/consultar-cliente.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsesorService } from '../../services/asesor.service'; // 👈 ajusta si tu ruta cambia
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-consultar-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consultar-cliente2.component.html',
  styleUrls: ['./consultar-cliente2.component.css'],
})
export class ConsultarCliente2Component {
  tipoCliente: string = '';
  numeroDocumento: string = '';
  mensaje: string = '';
  cliente: any = null;
  buscando: boolean = false;

  constructor(private asesorService: AsesorService) { }

  buscarCliente() {
    if (this.tipoCliente === 'Persona Juridica') {
      this.mensaje = 'La consulta de personas jurídicas está en desarrollo.';
      this.cliente = null;
      return;
    }
    if (!this.numeroDocumento) {
      this.mensaje = 'Por favor ingrese un número de documento.';
      return;
    }

    this.buscando = true;
    this.mensaje = '';
    this.cliente = null;

    this.asesorService.buscarCliente(this.numeroDocumento).subscribe({
      next: (resp) => {
        console.log('Respuesta del backend:', resp);
        this.buscando = false;
        this.mensaje = resp.mensaje;

        if (resp.existe) {
          this.cliente = resp.cliente;
        } else {
          this.cliente = null;
        }
      },
      error: (err) => {
        console.error('Error al buscar cliente:', err);
        this.buscando = false;
        this.mensaje = 'Error al consultar el cliente.';
      },
    });
  }
  limpiar(): void {
    this.numeroDocumento = '';
    this.mensaje = '';
    this.cliente = null;
  }

  soloNumeros(event: KeyboardEvent): void {
    const pattern = /^[0-9]$/;
    const inputChar = event.key;
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}
