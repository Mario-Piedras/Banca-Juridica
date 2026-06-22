import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../services/solicitud.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmModalComponent } from '../../../../shared/components/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-solicitar-producto-juridico',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './solicitar-producto-juridico.component.html',
  styleUrl: '../solicitar-producto/solicitar-producto.component.css'
})
export class SolicitarProductoJuridicoComponent implements OnInit {
  nit: string = '';
  producto: string = 'Cuenta de Ahorros (Persona Jurídica)';
  proposito_cuenta: string = '';
  justificacion: string = '';
  comentario: string = '';
  empresaEncontrada: boolean = false;
  empresaNoEncontrada: boolean = false;
  nombreEmpresa: string = '';
  isLoading: boolean = false;

  // Datos del usuario autenticado
  currentUser: any = null;

  // Modal confirmación al enviar solicitud
  confirmModalVisible = false;
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmModalType: 'success' | 'error' | 'confirm' = 'success';
  confirmModalConfirmText = 'Aceptar';

  constructor(
    private solicitudService: SolicitudService,
    private authService: AuthService
  ) { }

  get formularioValido(): boolean {
    return (
      this.nit.trim().length > 0 &&
      this.proposito_cuenta.trim().length > 0 &&
      this.empresaEncontrada
    );
  }

  ngOnInit(): void {
    // Obtener datos del usuario autenticado
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      console.log('Usuario autenticado:', user);
    });
  }

  // Validar que solo se ingresen números
  onNitInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    // Eliminar cualquier caracter que no sea número
    this.nit = value.replace(/[^0-9]/g, '');
    // Actualizar el valor del input
    input.value = this.nit;
  }

  // Buscar empresa
  buscarEmpresa(): void {
    if (!this.nit.trim()) {
      alert('Por favor ingrese un NIT');
      return;
    }

    console.log('Buscando empresa con NIT:', this.nit);
    this.isLoading = true;
    this.empresaEncontrada = false;
    this.empresaNoEncontrada = false;

    this.solicitudService.buscarEmpresa(this.nit).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Respuesta completa:', response);
        console.log('Empresa encontrada:', response.data);
        this.empresaEncontrada = true;
        this.empresaNoEncontrada = false;
        const empresa = response.data;
        this.nombreEmpresa = `${empresa.razon_social || ''}`.trim() || 'info_empresa';
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al buscar empresa:', error);
        this.empresaEncontrada = false;
        this.empresaNoEncontrada = true;
        this.nombreEmpresa = '';
      }
    });
  }

  // Envio de la solicitud
  enviarSolicitud(): void {
    // Validaciones
    if (!this.nit.trim()) {
      alert('Por favor ingrese el NIT del titular');
      return;
    }

    if (!this.empresaEncontrada) {
      alert('Debe buscar y verificar que la empresa existe antes de enviar la solicitud');
      return;
    }

    if (!this.currentUser) {
      alert('Error: No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.');
      return;
    }

    // Preparar datos de la solicitud
    const solicitud = {
      nit: this.nit,
      producto: this.producto,
      proposito_cuenta: this.proposito_cuenta,
      comentario: this.comentario,
      tipo_cliente: 'Jurídica'
    };

    console.log('Enviando solicitud:', solicitud);
    console.log('Usuario que crea la solicitud:', this.currentUser);

    this.isLoading = true;

    this.solicitudService.enviarSolicitud(solicitud).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Solicitud enviada exitosamente:', response);
        this.confirmModalTitle = 'Solicitud enviada';
        this.confirmModalMessage = 'La solicitud se ha enviado exitosamente.';
        this.confirmModalType = 'success';
        this.confirmModalConfirmText = 'Aceptar';
        this.confirmModalVisible = true;
        this.limpiarFormulario();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al enviar solicitud:', error);
        const errorMessage = error.error?.message || 'Error al enviar la solicitud';
        this.confirmModalTitle = 'Error';
        this.confirmModalMessage = errorMessage;
        this.confirmModalType = 'error';
        this.confirmModalConfirmText = 'Aceptar';
        this.confirmModalVisible = true;
      }
    });
  }

  // Cancelación del envio
  cancelar(): void {
    if (confirm('¿Está seguro de que desea cancelar? Se perderán los datos ingresados.')) {
      this.limpiarFormulario();
    }
  }

  // Limpieza del formulario
  private limpiarFormulario(): void {
    this.nit = '';
    this.justificacion = '';
    this.comentario = '';
    this.empresaEncontrada = false;
    this.empresaNoEncontrada = false;
    this.nombreEmpresa = '';
  }
}