import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsesorService } from '../../services/asesor.service'; // 👈 ajusta si tu ruta cambia
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-consultar-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consultar-cliente.component.html',
  styleUrls: ['./consultar-cliente.component.css'],
})
export class ConsultarClienteComponent {
  tipoCliente: '' | 'Persona Natural' | 'Persona Juridica' = '';
  identificacion: string = '';
  mensaje: string = '';
  cliente: any = null;
  buscando: boolean = false;

  constructor(private asesorService: AsesorService) { }

  // Busca el cliente o empresa según el tipo seleccionado
  buscarCliente() {
    if (!this.identificacion.trim()) {
      this.mensaje = this.tipoCliente === 'Persona Natural'
        ? 'Por favor ingrese un número de documento.'
        : 'Por favor ingrese un NIT.';
      return;
    }

    this.buscando = true;
    this.mensaje = '';
    this.cliente = null;

    // PERSONA NATURAL
    if (this.tipoCliente === 'Persona Natural') {
      this.asesorService.buscarCliente(this.identificacion).subscribe({
        next: (resp) => {
          console.log('Respuesta cliente:', resp);
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
          this.cliente = null;
        }
      });

      return;
    }

    // PERSONA JURÍDICA
    if (this.tipoCliente === 'Persona Juridica') {
      this.asesorService.buscarEmpresa(this.identificacion).subscribe({
        next: (resp) => {

          console.log('Respuesta empresa:', resp);
          this.buscando = false;
          this.mensaje = resp.mensaje;

          if (resp.existe) {

            // El backend devuelve "empresa"
            this.cliente = resp.empresa;

          } else {
            this.cliente = null;
          }
        },
        error: (err) => {
          console.error('Error al buscar empresa:', err);

          this.buscando = false;
          this.mensaje = 'Error al consultar la empresa.';
          this.cliente = null;
        }
      });

      return;
    }
  }

  limpiar(): void {
    this.identificacion = '';
    this.mensaje = '';
    this.cliente = null;
    this.buscando = false;
  }

  cambiarTipoCliente(): void {
    this.limpiar();
    this.buscando = false;
  }

  get rutaEditar() {
    return this.tipoCliente === 'Persona Natural'
      ? ['/asesor/editar-cliente', this.cliente.id_cliente]
      : ['/asesor/editar-cliente-juridico', this.cliente.id_info_empresas];
  }

  // Permite solamente caracteres numéricos
  soloNumeros(event: KeyboardEvent): void {
    const pattern = /^[0-9]$/;
    const inputChar = event.key;
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

}