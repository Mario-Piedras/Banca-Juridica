import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../services/solicitud.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-solicitar-producto-juridico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitar-producto-juridico.component.html',
  styleUrl: './solicitar-producto-juridico.component.css'
})
export class SolicitarProductoJuridicoComponent implements OnInit {
  cedula: string = '';
  producto: string = 'Cuenta de Ahorros Empresa';
  justificacion: string = '';
  comentario: string = '';
  clienteEncontrado: boolean = false;
  clienteNoEncontrado: boolean = false;
  nombreCliente: string = '';
  isLoading: boolean = false;

  // Datos del usuario autenticado
  currentUser: any = null;

  constructor(
    private solicitudService: SolicitudService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener datos del usuario autenticado
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      console.log('Usuario autenticado:', user);
    });
  }

  // Validar que solo se ingresen números
  onCedulaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    // Eliminar cualquier caracter que no sea número
    this.cedula = value.replace(/[^0-9]/g, '');
    // Actualizar el valor del input
    input.value = this.cedula;
  }

  buscarCliente(): void {
    if (!this.cedula.trim()) {
      alert('Por favor ingrese un NIT');
      return;
    }

    console.log('Buscando cliente con NIT:', this.cedula);
    this.isLoading = true;
    this.clienteEncontrado = false;
    this.clienteNoEncontrado = false;

    this.solicitudService.buscarCliente(this.cedula).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Respuesta completa:', response);
        console.log('Cliente encontrado:', response.data);
        this.clienteEncontrado = true;
        this.clienteNoEncontrado = false;
        const cliente = response.data;
        this.nombreCliente = `${cliente.primer_nombre || ''} ${cliente.segundo_nombre || ''} ${cliente.primer_apellido || ''} ${cliente.segundo_apellido || ''}`.trim() || 'Cliente';
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al buscar cliente:', error);
        this.clienteEncontrado = false;
        this.clienteNoEncontrado = true;
        this.nombreCliente = '';
      }
    });
  }

  enviarSolicitud(): void {
    // Validaciones
    if (!this.cedula.trim()) {
      alert('Por favor ingrese el NIT del titular');
      return;
    }

    if (!this.clienteEncontrado) {
      alert('Debe buscar y verificar que el cliente existe antes de enviar la solicitud');
      return;
    }

    if (!this.currentUser) {
      alert('Error: No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.');
      return;
    }

    // Preparar datos de la solicitud
    const solicitud = {
      cedula: this.cedula,
      producto: this.producto,
      comentario: this.comentario
    };

    console.log('Enviando solicitud:', solicitud);
    console.log('Usuario que crea la solicitud:', this.currentUser);

    this.isLoading = true;

    this.solicitudService.enviarSolicitud(solicitud).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Solicitud enviada exitosamente:', response);
        alert(' Solicitud enviada exitosamente');
        this.limpiarFormulario();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al enviar solicitud:', error);
        const errorMessage = error.error?.message || 'Error al enviar la solicitud';
        alert(` ${errorMessage}`);
      }
    });
  }

  cancelar(): void {
    if (confirm('¿Está seguro de que desea cancelar? Se perderán los datos ingresados.')) {
      this.limpiarFormulario();
    }
  }

  private limpiarFormulario(): void {
    this.cedula = '';
    this.producto = 'Cuenta de Ahorros Empresa';
    this.justificacion = '';
    this.comentario = '';
    this.clienteEncontrado = false;
    this.clienteNoEncontrado = false;
    this.nombreCliente = '';
  }
}
