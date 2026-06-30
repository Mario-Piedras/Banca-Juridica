import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../services/solicitud.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmModalComponent } from '../../../../shared/components/modals/confirm-modal/confirm-modal.component';

type TipoCliente = 'Natural' | 'Jurídica';
type EstadoBusqueda = {
  encontrado: boolean;
  noEncontrado: boolean;
  nombre: string;
};

@Component({
  selector: 'app-solicitar-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './solicitar-producto.component.html',
  styleUrl: './solicitar-producto.component.css'
})

export class SolicitarProductoComponent implements OnInit {
  tipoClienteSeleccionado: TipoCliente | '' = '';
  cedula: string = '';
  nit: string = '';

  // Valores guardados en la BD
  tipo_cuenta: string = 'Ahorros';
  proposito_cuenta: string = '';
  comentario: string = '';

  // Archivo solo para Persona Natural
  archivoFile: File | null = null;
  archivoSeleccionadoNombre: string = '';

  estadoBusqueda: EstadoBusqueda = {
    encontrado: false,
    noEncontrado: false,
    nombre: ''
  };

  currentUser: any = null;
  isLoading: boolean = false;

  // Modal de confirmación
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' | 'confirm' = 'success';
  modalConfirmText = 'Aceptar';
  private pendingAction: (() => void) | null = null;

  constructor(
    private solicitudService: SolicitudService,
    private authService: AuthService
  ) { }

  private mostrarModal(
    title: string,
    message: string,
    type: 'success' | 'error' | 'confirm',
    confirmText = 'Aceptar',
    action?: () => void
  ): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;
    this.modalConfirmText = confirmText;
    this.pendingAction = action ?? null;
    this.modalVisible = true;
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
      console.log('Usuario autenticado:', user);
    });
  }

  get formularioValido(): boolean {
    if (!this.tipoClienteSeleccionado) return false;

    const entrada = this.tipoClienteSeleccionado === 'Natural' ? this.cedula : this.nit;

    return entrada.trim().length > 0 && this.proposito_cuenta.trim().length > 0 && this.estadoBusqueda.encontrado;
  }

  get productoLabelVisual(): string {
    if (this.tipoClienteSeleccionado === 'Natural') {
      return 'Cuenta de Ahorros (Persona Natural)';
    }
    if (this.tipoClienteSeleccionado === 'Jurídica') {
      return 'Cuenta de Ahorros (Persona Jurídica)';
    }
    return 'Cuenta de Ahorros';
  }

  onCedulaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.cedula = value.replace(/[^0-9]/g, '');
    input.value = this.cedula;
  }

  onNitInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.nit = value.replace(/[^0-9]/g, '');
    input.value = this.nit;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.mostrarModal('Archivo inválido', 'El archivo es demasiado grande. El tamaño máximo es 5 MB.', 'error');
      input.value = '';
      this.archivoFile = null;
      this.archivoSeleccionadoNombre = '';
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.mostrarModal('Archivo inválido', 'Tipo de archivo no permitido. Usa PDF, JPG, PNG o Word.', 'error');
      input.value = '';
      this.archivoFile = null;
      this.archivoSeleccionadoNombre = '';
      return;
    }

    this.archivoFile = file;
    this.archivoSeleccionadoNombre = file.name;
  }

  // Búsqueda del cliente
  buscarClienteOVerificar(): void {
    const entrada = this.tipoClienteSeleccionado === 'Natural' ? this.cedula : this.nit;

    if (!entrada.trim()) {
      this.mostrarModal(
        'Información',
        this.tipoClienteSeleccionado === 'Natural'
          ? 'Por favor ingrese una cédula.'
          : 'Por favor ingrese un NIT.',
        'error'
      );
      return;
    }

    this.isLoading = true;
    this.estadoBusqueda = { encontrado: false, noEncontrado: false, nombre: '' };

    if (this.tipoClienteSeleccionado === 'Natural') {
      this.solicitudService.buscarCliente(this.cedula).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.estadoBusqueda.encontrado = true;
          const cliente = response.data;
          this.estadoBusqueda.nombre = `${cliente.primer_nombre || ''} ${cliente.segundo_nombre || ''} ${cliente.primer_apellido || ''} ${cliente.segundo_apellido || ''}`.trim() || 'Cliente';
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al buscar cliente:', error);
          this.estadoBusqueda.noEncontrado = true;
          this.estadoBusqueda.nombre = '';
        }
      });
      return;
    }

    this.solicitudService.buscarEmpresa(this.nit).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.estadoBusqueda.encontrado = true;
        const empresa = response.data;
        this.estadoBusqueda.nombre = `${empresa.razon_social || ''}`.trim() || 'info_empresa';
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al buscar empresa:', error);
        this.estadoBusqueda.noEncontrado = true;
        this.estadoBusqueda.nombre = '';
      }
    });
  }

  enviarSolicitud(): void {
    const entrada = this.tipoClienteSeleccionado === 'Natural' ? this.cedula : this.nit;

    if (!entrada.trim()) {
      this.mostrarModal(
        'Información',
        this.tipoClienteSeleccionado === 'Natural'
          ? 'Por favor ingrese la cédula del titular.'
          : 'Por favor ingrese el NIT del titular.',
        'error'
      );
      return;
    }

    if (!this.estadoBusqueda.encontrado) {
      this.mostrarModal(
        'Información',
        'Debe buscar y verificar que el cliente o empresa existe antes de enviar la solicitud.',
        'error'
      );
      return;
    }

    if (!this.currentUser) {
      this.mostrarModal(
        'Error',
        'No se pudo obtener la información del usuario. Inicie sesión nuevamente.',
        'error'
      );
      return;
    }

    const solicitud: any = {
      tipo_cuenta: this.tipo_cuenta,
      proposito_cuenta: this.proposito_cuenta,
      comentario: this.comentario,
      tipo_cliente: this.tipoClienteSeleccionado
    };

    // Archivo solo para Natural
    if (this.tipoClienteSeleccionado === 'Natural') {
      solicitud.archivo = this.archivoFile;
    }


    if (this.tipoClienteSeleccionado === 'Natural') {
      solicitud.cedula = this.cedula;
    } else {
      solicitud.nit = this.nit;
    }

    console.log('Enviando solicitud:', solicitud);

    this.isLoading = true;
    this.solicitudService.enviarSolicitud(solicitud).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Solicitud enviada exitosamente:', response);
        this.modalTitle = 'Solicitud enviada';
        this.modalMessage = 'La solicitud se ha enviado exitosamente.';
        this.modalType = 'success';
        this.modalConfirmText = 'Aceptar';
        this.modalVisible = true;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al enviar solicitud:', error);
        const errorMessage = error.error?.message || 'Error al enviar la solicitud';
        this.modalTitle = 'Error';
        this.modalMessage = errorMessage;
        this.modalType = 'error';
        this.modalConfirmText = 'Aceptar';
        this.modalVisible = true;
      }
    });
  }

  cancelar(): void {
    this.mostrarModal(
      'Cancelar solicitud',
      '¿Está seguro de que desea cancelar? Se perderán los datos ingresados.',
      'confirm',
      'Aceptar',
      () => this.limpiarFormulario()
    );
  }

  // Limpieza del formulario
  private limpiarFormulario(): void {
    this.tipoClienteSeleccionado = '';
    this.cedula = '';
    this.nit = '';
    this.proposito_cuenta = '';
    this.comentario = '';
    this.estadoBusqueda = { encontrado: false, noEncontrado: false, nombre: '' };
    this.archivoFile = null;
    this.archivoSeleccionadoNombre = '';
  }

  onConfirmModal(): void {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    } else if (this.modalType === 'success') {
      // Limpiar TODO cuando el usuario presiona Aceptar en el modal.
      this.limpiarFormulario();
    }
    this.modalVisible = false;
  }

}