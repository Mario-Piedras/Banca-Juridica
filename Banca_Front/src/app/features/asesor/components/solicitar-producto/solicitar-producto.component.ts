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

  // Valor guardado en BD
  productoSeleccionado: string = 'Ahorros';

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

  confirmModalVisible = false;
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmModalType: 'success' | 'error' | 'confirm' = 'success';
  confirmModalConfirmText = 'Aceptar';

  constructor(
    private solicitudService: SolicitudService,
    private authService: AuthService
  ) {}

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
      alert('El archivo es demasiado grande. El tamaño máximo es 5MB.');
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
      alert('Tipo de archivo no permitido. Use PDF, JPG, PNG o Word.');
      input.value = '';
      this.archivoFile = null;
      this.archivoSeleccionadoNombre = '';
      return;
    }

    this.archivoFile = file;
    this.archivoSeleccionadoNombre = file.name;
  }

  buscarClienteOVerificar(): void {

    if (!this.tipoClienteSeleccionado) {
      alert('Seleccione el tipo de cliente');
      return;
    }

    const entrada = this.tipoClienteSeleccionado === 'Natural' ? this.cedula : this.nit;

    if (!entrada.trim()) {
      alert(this.tipoClienteSeleccionado === 'Natural' ? 'Por favor ingrese una cédula' : 'Por favor ingrese un NIT');
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
    if (!this.tipoClienteSeleccionado) {
      alert('Seleccione el tipo de cliente');
      return;
    }

    const entrada = this.tipoClienteSeleccionado === 'Natural' ? this.cedula : this.nit;

    if (!entrada.trim()) {
      alert(this.tipoClienteSeleccionado === 'Natural' ? 'Por favor ingrese la cédula del titular' : 'Por favor ingrese el NIT del titular');
      return;
    }

    if (!this.estadoBusqueda.encontrado) {
      alert('Debe buscar y verificar que el cliente/empresa existe antes de enviar la solicitud');
      return;
    }

    if (!this.currentUser) {
      alert('Error: No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.');
      return;
    }

    const solicitud: any = {
      producto: this.productoSeleccionado, // Ahorros en BD
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

  cancelar(): void {
    if (confirm('¿Está seguro de que desea cancelar? Se perderán los datos ingresados.')) {
      this.limpiarFormulario();
    }
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

    const fileInput = document.getElementById('archivoInputSolicitudProducto') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  }

}