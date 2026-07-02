import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RetiroService } from '../../services/retiro.service';
import { ConsignacionService } from '../../services/consignacion.service';
import { ConfirmModalComponent, ConfirmModalType } from '../../../../shared/components/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-consignacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent],
  templateUrl: './consignacion.component.html',
  styleUrls: ['./consignacion.component.css']
})
export class ConsignacionComponent {
  consignacionForm: FormGroup;
  cuentaEncontrada = false;
  idCuenta: number = 0;
  consignacionRealizada = false;
  readonly MONTO_MAXIMO = 9999999999999;
  readonly MONTO_MINIMO = 1;
  readonly MAX_DIGITOS = 13;

  datosComprobante = {
    idTransaccion: 0,
    numeroCuenta: '',
    numeroDocumento: '',
    titular: '',
    valorConsignado: 0,
    tipoConsignacion: '',
    codigoCheque: '',
    numeroCheque: '',
    saldoAnterior: 0,
    saldoNuevo: 0,
    fecha: new Date(),
    nombreCajero: '',
    tipoTitular: 'Natural'
  };

  // Modal de confirmación
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: ConfirmModalType = 'success';
  modalConfirmText = 'Aceptar';
  private pendingAction: (() => void) | null = null;

  constructor(
    private fb: FormBuilder,
    private retiroService: RetiroService,
    private consignacionService: ConsignacionService
  ) {
    this.consignacionForm = this.fb.group({
      numeroCuenta: ['', [Validators.required]],
      numeroDocumento: [{ value: '', disabled: true }],
      saldoDisponible: [{ value: '', disabled: true }],
      titular: [{ value: '', disabled: true }],
      tipoConsignacion: [{ value: '', disabled: true }, [Validators.required]],
      valor: [{ value: '', disabled: true }, [Validators.required, Validators.min(this.MONTO_MINIMO)]],
      codigoCheque: [{ value: '', disabled: true }],
      numeroCheque: [{ value: '', disabled: true }]
    });

    // Obtener nombre del cajero desde localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.datosComprobante.nombreCajero = user.nombre || 'Cajero Principal';
      } catch (e) {
        this.datosComprobante.nombreCajero = 'Cajero Principal';
      }
    } else {
      this.datosComprobante.nombreCajero = 'Cajero Principal';
    }

    this.consignacionForm.get('tipoConsignacion')?.valueChanges.subscribe(tipo => {
      if (tipo === 'Cheque') {
        this.consignacionForm.get('codigoCheque')?.enable();
        this.consignacionForm.get('numeroCheque')?.enable();
      } else {
        this.consignacionForm.get('codigoCheque')?.disable();
        this.consignacionForm.get('numeroCheque')?.disable();
        this.consignacionForm.patchValue({
          codigoCheque: '',
          numeroCheque: ''
        });
      }
    });
  }

  private mostrarModal(
    type: ConfirmModalType,
    title: string,
    message: string,
    confirmText = 'Aceptar',
    action?: () => void
  ): void {
    this.modalType = type;
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalConfirmText = confirmText;
    this.pendingAction = action ?? null;
    this.modalVisible = true;
  }

  onInputValor(event: Event) {
    const input = event.target as HTMLInputElement;

    // 1. Remover puntos existentes y otros caracteres no numéricos
    let valor = input.value.replace(/\./g, '').replace(/[^0-9]/g, '');

    // 2. Limitar a 13 dígitos
    if (valor.length > this.MAX_DIGITOS) {
      valor = valor.substring(0, this.MAX_DIGITOS);
    }

    // 3. Convertir a número para el form (para validaciones)
    const numero = valor ? Number(valor) : 0;
    this.consignacionForm.patchValue({ valor: numero }, { emitEvent: false });

    // 4. Formatear con puntos cada 3 dígitos desde la derecha
    const valorFormateado = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // 5. Actualizar el input visual con el formato (sobrescribe el binding del form)
    input.value = valorFormateado;
  }

  onInputNumeroCuenta(event: Event) {

    const input = event.target as HTMLInputElement;

    // Permitir únicamente números
    let valor = input.value.replace(/[^0-9]/g, '');

    // Respetar maxlength del HTML
    valor = valor.substring(0, 20);

    // Actualizar visualmente
    input.value = valor;

    // Actualizar FormControl
    this.consignacionForm.patchValue(
      {
        numeroCuenta: valor
      },
      {
        emitEvent: false
      }
    );

  }

  // Búsqueda de la cuenta
  buscarCuenta() {
    const numeroCuenta = this.consignacionForm.get('numeroCuenta')?.value;
    if (!numeroCuenta) {
      this.mostrarModal('error', 'Error', 'Por favor ingrese un número de cuenta');
      return;
    }

    this.retiroService.buscarCuenta({ numeroCuenta }).subscribe({
      next: (response) => {
        if (response.existe && response.datos) {
          const datos = response.datos;
          this.mostrarModal('success', 'Éxito', response.mensaje, 'Aceptar', () => {
            this.cuentaEncontrada = true;
            this.idCuenta = datos.idCuenta;
            const tipoTitular = datos.idCliente ? 'Natural' : 'Juridica';
            this.datosComprobante.tipoTitular = tipoTitular;
            this.consignacionForm.get('tipoConsignacion')?.enable();
            this.consignacionForm.get('valor')?.enable();
            this.consignacionForm.patchValue({
              numeroDocumento: datos.numeroDocumento,
              titular: datos.titular,
              saldoDisponible: `$${datos.saldo.toLocaleString('es-CO')}`
            });
          }
          );
        } else {
          this.mostrarModal('error', 'Error', response.mensaje);
          this.limpiarDatosCuenta();
        }
      },
      error: (error) => {
        console.error('Error al buscar cuenta:', error);
        this.mostrarModal('error', 'Error', 'Error al buscar la cuenta. Intente nuevamente.');
        this.limpiarDatosCuenta();
      }
    });
  }

  onProcesarConsignacion() {
    if (this.consignacionForm.invalid || !this.cuentaEncontrada) {
      this.mostrarModal('error', 'Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    const numeroCuenta = this.consignacionForm.get('numeroCuenta')?.value;
    const tipoConsignacion = this.consignacionForm.get('tipoConsignacion')?.value;
    const valor = this.consignacionForm.get('valor')?.value;
    const titular = this.consignacionForm.get('titular')?.value;
    const numeroDocumento = this.consignacionForm.get('numeroDocumento')?.value;
    const monto = parseFloat(valor);

    if (monto > this.MONTO_MAXIMO) {
      this.mostrarModal('error', 'Error', '⚠️ El valor máximo permitido es $9,999,999,999,999');
      return;
    }

    if (tipoConsignacion === 'Cheque') {
      const codigoCheque = this.consignacionForm.get('codigoCheque')?.value;
      const numeroCheque = this.consignacionForm.get('numeroCheque')?.value;

      if (!codigoCheque || !numeroCheque) {
        this.mostrarModal(
          'error',
          'Error',
          '⚠️ Para consignación con cheque debe ingresar código y número de cheque'
        );
        return;
      }
    }

    const datosConsignacion = {
      numeroCuenta: numeroCuenta,
      tipoConsignacion: tipoConsignacion,
      valor: monto,
      codigoCheque: tipoConsignacion === 'Cheque' ? this.consignacionForm.get('codigoCheque')?.value : undefined,
      numeroCheque: tipoConsignacion === 'Cheque' ? this.consignacionForm.get('numeroCheque')?.value : undefined
    };

    this.consignacionService.procesarConsignacion(datosConsignacion).subscribe({
      next: (response) => {
        if (response.exito && response.datos) {
          const datos = response.datos;
          this.mostrarModal('success', 'Éxito', `${response.mensaje}
Saldo anterior: $${datos.saldoAnterior.toLocaleString()}
Valor consignado: $${datos.valorConsignado.toLocaleString()}
Saldo nuevo: $${datos.saldoNuevo.toLocaleString()}`, 'Aceptar', () => {
            this.datosComprobante = {
              idTransaccion: datos.idTransaccion,
              numeroCuenta,
              numeroDocumento,
              titular,
              valorConsignado: datos.valorConsignado,
              tipoConsignacion,
              codigoCheque: datos.codigoCheque || '',
              numeroCheque: datos.numeroCheque || '',
              saldoAnterior: datos.saldoAnterior,
              saldoNuevo: datos.saldoNuevo,
              fecha: new Date(datos.fechaTransaccion),
              nombreCajero: this.datosComprobante.nombreCajero,
              tipoTitular: datos.tipoTitular || this.datosComprobante.tipoTitular
            };
            this.consignacionRealizada = true;
          }
          );
        } else {
          this.mostrarModal('error', 'Error', response.mensaje);
        }
      },
      error: (error) => {
        console.error('Error al procesar consignación:', error);
        this.mostrarModal('error', 'Error', 'Error al procesar la consignación. Intente nuevamente.');
      }
    });
  }

  // Impresión del comprobante
  imprimirComprobante() {
    window.print();
  }

  // Limpieza del formulario
  limpiarFormulario() {
    this.consignacionForm.reset();
    this.cuentaEncontrada = false;
    this.idCuenta = 0;
    this.consignacionRealizada = false;

    // Re-deshabilitar todos los campos
    this.consignacionForm.get('numeroDocumento')?.disable();
    this.consignacionForm.get('saldoDisponible')?.disable();
    this.consignacionForm.get('titular')?.disable();
    this.consignacionForm.get('tipoConsignacion')?.disable();
    this.consignacionForm.get('valor')?.disable();
    this.consignacionForm.get('codigoCheque')?.disable();
    this.consignacionForm.get('numeroCheque')?.disable();
  }

  limpiarDatosCuenta() {
    this.cuentaEncontrada = false;
    this.idCuenta = 0;

    // Deshabilitar campos dependientes
    this.consignacionForm.get('tipoConsignacion')?.disable();
    this.consignacionForm.get('valor')?.disable();

    this.datosComprobante.tipoTitular = 'Natural';

    this.consignacionForm.patchValue({
      numeroDocumento: '',
      titular: '',
      saldoDisponible: '',
      tipoConsignacion: '',
      valor: ''
    });
  }

  onCancelar() {
    this.consignacionForm.reset();
    this.limpiarDatosCuenta();

    // Re-deshabilitar todos los campos
    this.consignacionForm.get('numeroDocumento')?.disable();
    this.consignacionForm.get('saldoDisponible')?.disable();
    this.consignacionForm.get('titular')?.disable();
    this.consignacionForm.get('tipoConsignacion')?.disable();
    this.consignacionForm.get('valor')?.disable();
    this.consignacionForm.get('codigoCheque')?.disable();
    this.consignacionForm.get('numeroCheque')?.disable();
  }

  onConfirmModal(): void {
    this.modalVisible = false;

    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
  }

}