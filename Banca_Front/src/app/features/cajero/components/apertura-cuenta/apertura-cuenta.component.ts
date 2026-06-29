import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AperturaService, VerificarClienteResponse, AperturarCuentaResponse } from '../../services/apertura.service';
import { ConfirmModalComponent, ConfirmModalType } from '../../../../shared/components/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-apertura-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './apertura-cuenta.component.html',
  styleUrls: ['./apertura-cuenta.component.css']
})

export class AperturaCuentaComponent {

  iconoEstado: string = '';

  // Constantes de validación
  readonly MONTO_MAXIMO = 9999999999999;
  readonly MONTO_MINIMO = 0;
  readonly MAX_DIGITOS = 13;

  // Límites de longitud por tipo de documento
  readonly MAX_LENGTH_DOCUMENTO: { [key: string]: number } = {
    'CC': 10,
    'CE': 7,
    'TI': 11,
    'PA': 9
  };

  // Datos del formulario
  tipoCliente: string = '';
  tipoDocumento: string = '';
  numeroDocumento: string = '';
  nombreCompleto: string = '';
  nit: string = '';
  razonSocial: string = '';
  depositoInicial: string = '';
  valorDeposito: number = 0;
  codigoCheque: string = '';
  numeroCheque: string = '';
  numeroCuenta: string = '';

  // Control de estado
  clienteVerificado: boolean = false;
  estadoSolicitud: string = '';
  mensajeEstado: string = '';
  idSolicitud: number | null = null;
  mostrarFormularioDeposito: boolean = false;
  cuentaAperturada: boolean = false;

  // Datos del comprobante
  datosComprobante: any = null;

  // Modal de confirmación
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: ConfirmModalType = 'success';
  modalConfirmText = 'Aceptar';

  constructor(private aperturaService: AperturaService) { }

  private mostrarModal(params: {
    title: string;
    message: string;
    type: ConfirmModalType;
    confirmText?: string;
  }): void {
    this.modalTitle = params.title;
    this.modalMessage = params.message;
    this.modalType = params.type;
    this.modalConfirmText = params.confirmText ?? 'Aceptar';
    this.modalVisible = true;
  }

  // Validar número de documento en tiempo real
  onInputDocumento(event: Event) {
    const input = event.target as HTMLInputElement;
    let valor = input.value;

    // Validación según tipo de documento
    if (this.tipoDocumento === 'PA') {
      // Pasaporte: alfanumérico (letras y números, sin espacios ni caracteres especiales)
      valor = valor.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    } else {
      // CC, CE, TI: solo números
      valor = valor.replace(/[^0-9]/g, '');
    }

    // Limitar longitud según tipo
    const maxLength = this.MAX_LENGTH_DOCUMENTO[this.tipoDocumento] || 20;
    if (valor.length > maxLength) {
      valor = valor.substring(0, maxLength);
    }

    // Actualizar input y modelo
    input.value = valor;
    this.numeroDocumento = valor;
  }

  // Validar número de nit en tiempo real
  onInputNit(event: Event) {
    const input = event.target as HTMLInputElement;

    let valor = input.value;

    // Permitir solo números y guion
    valor = valor.replace(/[^0-9-]/g, '');

    // Solo permitir un guion
    const partes = valor.split('-');
    if (partes.length > 2) {
      valor = partes[0] + '-' + partes.slice(1).join('');
    }

    // Máximo 20 caracteres
    valor = valor.substring(0, 20);

    input.value = valor;
    this.nit = valor;
  }

  // Validar cuando cambia el tipo de documento
  onTipoDocumentoChange() {
    // Limpiar el número de documento cuando cambia el tipo
    this.numeroDocumento = '';
  }

  onTipoClienteChange() {
    this.limpiarFormulario();

    const tipo = this.tipoCliente;
    this.tipoCliente = tipo;
  }

  // Búsqueda del cliente
  buscarCliente() {
    if (this.tipoCliente === 'Natural' && (!this.tipoDocumento || !this.numeroDocumento)) {
      this.mostrarModal({
        title: 'Validación',
        message: 'Por favor ingrese tipo y número de documento',
        type: 'error'
      });
      return;

    }

    if (this.tipoCliente === 'Juridica' && !this.nit) {
      this.mostrarModal({
        title: 'Validación',
        message: 'Por favor ingrese el NIT',
        type: 'error'
      });
      return;
    }

    // Validación adicional antes de enviar
    if (this.tipoCliente === 'Natural' && !this.validarDocumento()) {
      return;
    }

    let datosBusqueda: any;

    if (this.tipoCliente === 'Natural') {

      datosBusqueda = {
        tipoCliente: 'Natural',
        tipoDocumento: this.tipoDocumento,
        numeroDocumento: this.numeroDocumento
      };
    } else {
      datosBusqueda = {
        tipoCliente: 'Juridica',
        nit: this.nit
      };
    }

    this.aperturaService.verificarCliente(datosBusqueda).subscribe({
      next: (respuesta: VerificarClienteResponse) => {
        this.clienteVerificado = true;
        this.estadoSolicitud = respuesta.estado;
        this.mensajeEstado = respuesta.mensaje;
        this.nombreCompleto = respuesta.nombreCompleto || '';
        this.idSolicitud = respuesta.idSolicitud || null;
        this.iconoEstado = respuesta.icono || 'info';

        this.mostrarFormularioDeposito = respuesta.estado === 'Aprobada';
      },
      error: (error: any) => {
        console.error('Error al verificar cliente:', error);
        this.mostrarModal({
          title: 'Error',
          message: 'Error al conectar con el servidor. Verifique que el backend esté corriendo.',
          type: 'error'
        });
      }
    });
  }

  // Validar formato del documento
  validarDocumento(): boolean {
    const valor = this.numeroDocumento;
    const tipo = this.tipoDocumento;

    if (!valor || !tipo) return false;

    switch (tipo) {
      case 'CC':
        if (valor.length < 6 || valor.length > 10) {
          this.mostrarModal({
            title: 'Validación',
            message: '⚠️ La Cédula de Ciudadanía debe tener entre 6 y 10 dígitos',
            type: 'error'
          });
          return false;
        }
        if (!/^\d+$/.test(valor)) {
          this.mostrarModal({
            title: 'Validación',
            message: '⚠️ La Cédula de Ciudadanía solo puede contener números',
            type: 'error'
          });
          return false;
        }
        break;

      case 'CE':
        if (valor.length < 6 || valor.length > 7) {
          this.mostrarModal({
            title: 'Validación',
            message: '⚠️ La Cédula de Extranjería debe tener entre 6 y 7 dígitos',
            type: 'error'
          });
          return false;
        }
        if (!/^\d+$/.test(valor)) {
          this.mostrarModal({
            title: 'Validación',
            message: '⚠️ La Cédula de Extranjería solo puede contener números',
            type: 'error'
          });
          return false;
        }
        break;

      case 'TI':
        if (valor.length < 10 || valor.length > 11) {
          this.mostrarModal({
            title: 'Validación',
            message: '⚠️ La Tarjeta de Identidad debe tener entre 10 y 11 dígitos',
            type: 'error'
          });
          return false;
        }
        if (!/^\d+$/.test(valor)) {
          this.mostrarModal({
            title: 'Validación',
            message: '⚠️ La Tarjeta de Identidad solo puede contener números',
            type: 'error'
          });
          return false;
        }
        break;

      case 'PA':
        if (valor.length < 6 || valor.length > 9) {
          this.mostrarModal({
            title: 'Validación',
            message: '⚠️ El Pasaporte debe tener entre 6 y 9 caracteres',
            type: 'error'
          });
          return false;
        }
        if (!/^[A-Z0-9]+$/.test(valor)) {
          this.mostrarModal({
            title: 'Validación',
            message: '⚠️ El Pasaporte solo puede contener letras y números',
            type: 'error'
          });
          return false;
        }
        break;
    }

    return true;
  }

  // Validar en tiempo real monto
  onInputMonto(event: Event) {
    const input = event.target as HTMLInputElement;
    // Remover puntos para trabajar con números puros
    let valor = input.value.replace(/\./g, '');
    // Solo números
    valor = valor.replace(/[^0-9]/g, '');

    // Limitar a MAX_DIGITOS
    if (valor.length > this.MAX_DIGITOS) {
      valor = valor.substring(0, this.MAX_DIGITOS);
    }

    const valorFormateado = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = valorFormateado;

    this.valorDeposito = valor ? Number(valor) : 0;
  }

  // Valida el monto
  validarMonto() {
    const monto = Number(this.valorDeposito);

    if (monto > this.MONTO_MAXIMO) this.valorDeposito = this.MONTO_MAXIMO;
    if (monto < 0) this.valorDeposito = 0;

    this.valorDeposito = Math.floor(monto);
  }

  // Apertura de cuenta
  abrirCuenta() {
    if (!this.idSolicitud) {
      this.mostrarModal({
        title: 'Validación',
        message: 'No hay una solicitud válida para aperturar',
        type: 'error'
      });
      return;
    }

    if (!this.depositoInicial) {
      this.mostrarModal({
        title: 'Validación',
        message: 'Seleccione el tipo de depósito inicial',
        type: 'error'
      });
      return;
    }

    const monto = Math.floor(Number(this.valorDeposito));

    if (isNaN(monto) || monto < 0) {
      this.mostrarModal({
        title: 'Validación',
        message: '⚠️ El valor del depósito no puede ser negativo',
        type: 'error'
      });
      return;
    }

    if (monto > this.MONTO_MAXIMO) {
      this.mostrarModal({
        title: 'Validación',
        message: '⚠️ El monto máximo permitido es $9,999,999,999,999',
        type: 'error'
      });
      return;
    }

    if (this.depositoInicial === 'Cheque') {
      if (!this.codigoCheque || !this.numeroCheque) {
        this.mostrarModal({
          title: 'Validación',
          message: '⚠️ Para depósito con cheque debe ingresar código y número de cheque',
          type: 'error'
        });
        return;
      }
    }

    const datosApertura = {
      tipoCliente: this.tipoCliente,
      idSolicitud: this.idSolicitud,
      tipoDeposito: this.depositoInicial,
      valorDeposito: monto,
      codigoCheque: this.depositoInicial === 'Cheque' ? this.codigoCheque : undefined,
      numeroCheque: this.depositoInicial === 'Cheque' ? this.numeroCheque : undefined
    };

    this.aperturaService.aperturarCuenta(datosApertura).subscribe({
      next: (respuesta: AperturarCuentaResponse) => {
        if (respuesta.exito) {
          this.cuentaAperturada = true;
          this.numeroCuenta = respuesta.numeroCuenta || '';

          this.datosComprobante = {
            numeroCuenta: respuesta.numeroCuenta,
            tipoCliente: this.tipoCliente,
            nombreCliente: this.nombreCompleto,
            tipoDocumento: this.tipoCliente === 'Natural' ? this.tipoDocumento : 'NIT',
            numeroDocumento: this.tipoCliente === 'Natural' ? this.numeroDocumento : this.nit,
            tipoDeposito: this.depositoInicial,
            valorDeposito: monto,
            fecha: new Date(),
            idTransaccion: respuesta.idTransaccion
          };

          this.mostrarModal({
            title: 'Éxito',
            message: `${respuesta.mensaje}`,
            type: 'success'
          });
        } else {
          this.mostrarModal({
            title: 'Error',
            message: `❌ ${respuesta.mensaje}`,
            type: 'error'
          });
        }
      },
      error: (error: any) => {
        console.error('Error al aperturar cuenta:', error);
        this.mostrarModal({
          title: 'Error',
          message: 'Error al procesar la apertura. Intente nuevamente.',
          type: 'error'
        });
      }
    });
  }

  // Limpieza del formulario
  limpiarFormulario() {
    this.tipoDocumento = '';
    this.numeroDocumento = '';
    this.nit = '';
    this.razonSocial = '';
    this.nombreCompleto = '';
    this.depositoInicial = '';
    this.valorDeposito = 0;
    this.codigoCheque = '';
    this.numeroCheque = '';
    this.numeroCuenta = '';
    this.clienteVerificado = false;
    this.mostrarFormularioDeposito = false;
    this.cuentaAperturada = false;
    this.datosComprobante = null;
    this.estadoSolicitud = '';
    this.mensajeEstado = '';
    this.idSolicitud = null;
  }

  // Impresión del comprobante
  imprimirComprobante() {
    window.print();
  }

}