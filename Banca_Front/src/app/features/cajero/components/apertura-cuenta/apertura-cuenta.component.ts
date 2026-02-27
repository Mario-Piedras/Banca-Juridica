import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AperturaService, VerificarClienteResponse, AperturarCuentaResponse } from '../../services/apertura.service';

@Component({
  selector: 'app-apertura-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  tipoDocumento: string = '';
  numeroDocumento: string = '';
  nombreCompleto: string = '';
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

  constructor(private aperturaService: AperturaService) { }

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

  // Validar cuando cambia el tipo de documento
  onTipoDocumentoChange() {
    // Limpiar el número de documento cuando cambia el tipo
    this.numeroDocumento = '';
  }

  buscarCliente() {
    if (!this.tipoDocumento || !this.numeroDocumento) {
      alert('Por favor ingrese el tipo y número de documento');
      return;
    }

    // Validación adicional antes de enviar
    if (!this.validarDocumento()) {
      return;
    }

    this.aperturaService.verificarCliente({
      tipoDocumento: this.tipoDocumento,
      numeroDocumento: this.numeroDocumento
    }).subscribe({
      next: (respuesta: VerificarClienteResponse) => {
        this.clienteVerificado = true;
        this.estadoSolicitud = respuesta.estado;
        this.mensajeEstado = respuesta.mensaje;
        this.nombreCompleto = respuesta.nombreCompleto || '';
        this.idSolicitud = respuesta.idSolicitud || null;
        this.iconoEstado = respuesta.icono || 'info';

        if (respuesta.estado === 'Aprobada') {
          this.mostrarFormularioDeposito = true;
        } else {
          this.mostrarFormularioDeposito = false;
        }
      },
      error: (error: any) => {
        console.error('Error al verificar cliente:', error);
        alert('Error al conectar con el servidor. Verifique que el backend esté corriendo.');
      }
    });
  }

  // Validar formato del documento
  validarDocumento(): boolean {
    const valor = this.numeroDocumento;
    const tipo = this.tipoDocumento;

    if (!valor || !tipo) {
      return false;
    }

    switch (tipo) {
      case 'CC':
        if (valor.length < 6 || valor.length > 10) {
          alert('⚠️ La Cédula de Ciudadanía debe tener entre 6 y 10 dígitos');
          return false;
        }
        if (!/^\d+$/.test(valor)) {
          alert('⚠️ La Cédula de Ciudadanía solo puede contener números');
          return false;
        }
        break;

      case 'CE':
        if (valor.length < 6 || valor.length > 7) {
          alert('⚠️ La Cédula de Extranjería debe tener entre 6 y 7 dígitos');
          return false;
        }
        if (!/^\d+$/.test(valor)) {
          alert('⚠️ La Cédula de Extranjería solo puede contener números');
          return false;
        }
        break;

      case 'TI':
        if (valor.length < 10 || valor.length > 11) {
          alert('⚠️ La Tarjeta de Identidad debe tener entre 10 y 11 dígitos');
          return false;
        }
        if (!/^\d+$/.test(valor)) {
          alert('⚠️ La Tarjeta de Identidad solo puede contener números');
          return false;
        }
        break;

      case 'PA':
        if (valor.length < 6 || valor.length > 9) {
          alert('⚠️ El Pasaporte debe tener entre 6 y 9 caracteres');
          return false;
        }
        if (!/^[A-Z0-9]+$/.test(valor)) {
          alert('⚠️ El Pasaporte solo puede contener letras y números');
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

  // Formatear con puntos cada 3 dígitos
  const valorFormateado = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Actualizar el input con formato
  input.value = valorFormateado;

  // Guardar el valor sin formato en el modelo
  this.valorDeposito = valor ? Number(valor) : 0;
}


  validarMonto() {
    const monto = Number(this.valorDeposito);

    if (monto > this.MONTO_MAXIMO) {
      this.valorDeposito = this.MONTO_MAXIMO;
    }

    if (monto < 0) {
      this.valorDeposito = 0;
    }

    this.valorDeposito = Math.floor(monto);
  }

  abrirCuenta() {
    if (!this.idSolicitud) {
      alert('No hay una solicitud válida para aperturar');
      return;
    }

    if (!this.depositoInicial) {
      alert('Seleccione el tipo de depósito inicial');
      return;
    }

    const monto = Math.floor(Number(this.valorDeposito));

    if (isNaN(monto) || monto < 0) {
      alert('⚠️ El valor del depósito no puede ser negativo');
      return;
    }

    if (monto > this.MONTO_MAXIMO) {
      alert(`⚠️ El monto máximo permitido es $9,999,999,999,999`);
      return;
    }

    if (this.depositoInicial === 'Cheque') {
      if (!this.codigoCheque || !this.numeroCheque) {
        alert('⚠️ Para depósito con cheque debe ingresar código y número de cheque');
        return;
      }
    }

    const datosApertura = {
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
            nombreCliente: this.nombreCompleto,
            tipoDocumento: this.tipoDocumento,
            numeroDocumento: this.numeroDocumento,
            tipoDeposito: this.depositoInicial,
            valorDeposito: monto,
            fecha: new Date(),
            idTransaccion: respuesta.idTransaccion
          };

          alert('✅ ' + respuesta.mensaje + '\nNúmero de cuenta: ' + respuesta.numeroCuenta);
        } else {
          alert('❌ ' + respuesta.mensaje);
        }
      },
      error: (error: any) => {
        console.error('Error al aperturar cuenta:', error);
        alert('Error al procesar la apertura. Intente nuevamente.');
      }
    });
  }

  limpiarFormulario() {
    this.tipoDocumento = '';
    this.numeroDocumento = '';
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

  imprimirComprobante() {
    window.print();
  }
}
