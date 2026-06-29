import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RetiroService } from '../../services/retiro.service';
import { ConfirmModalComponent, ConfirmModalType } from '../../../../shared/components/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-retiro-ventanilla',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent],
  templateUrl: './retiro-ventanilla.component.html',
  styleUrls: ['./retiro-ventanilla.component.css']
})
export class RetiroVentanillaComponent {
  retiroForm: FormGroup;
  cuentaEncontrada = false;
  idCuenta: number = 0;
  retiroRealizado = false;

  // Constantes alineadas con apertura
  readonly MONTO_MAXIMO = 9999999999999; // 13 dígitos
  readonly MONTO_MINIMO = 1; // Mínimo $1 para retiro
  readonly MAX_DIGITOS = 13;

  datosComprobante = {
    idTransaccion: 0,
    numeroCuenta: '',
    numeroDocumento: '',
    titular: '',
    montoRetirado: 0,
    saldoAnterior: 0,
    saldoNuevo: 0,
    fecha: new Date(),
    tipoTitular: 'Natural'
  };

  // Modal de confirmación
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: ConfirmModalType = 'success';
  modalConfirmText = 'Aceptar';

  constructor(
    private fb: FormBuilder,
    private retiroService: RetiroService
  ) {
    this.retiroForm = this.fb.group({
      numeroCuenta: ['', [Validators.required]],
      numeroDocumento: [{ value: '', disabled: true }],
      titular: [{ value: '', disabled: true }],
      saldoDisponible: [{ value: '', disabled: true }],
      montoRetirar: [{ value: '', disabled: true }, [Validators.required, Validators.min(this.MONTO_MINIMO)]]  // ✅ disabled
    });
  }

  private mostrarModal(type: ConfirmModalType, title: string, message: string): void {
    this.modalType = type;
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalConfirmText = 'Aceptar';
    this.modalVisible = true;
  }

  // Validar monto en tiempo real
  onInputMonto(event: Event) {
    const input = event.target as HTMLInputElement;

    // 1. Remover puntos existentes y otros caracteres no numéricos
    let valor = input.value.replace(/\./g, '').replace(/[^0-9]/g, '');

    // 2. Limitar a 13 dígitos
    if (valor.length > this.MAX_DIGITOS) {
      valor = valor.substring(0, this.MAX_DIGITOS);
    }

    // 3. Convertir a número para el form (para validaciones)
    const numero = valor ? Number(valor) : 0;
    this.retiroForm.patchValue({ montoRetirar: numero }, { emitEvent: false });

    // 4. Formatear con puntos cada 3 dígitos desde la derecha
    const valorFormateado = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // 5. Actualizar el input visual con el formato (sobrescribe el binding del form)
    input.value = valorFormateado;
  }

  // Permitir solo números en número de cuenta
  onInputNumeroCuenta(event: Event) {
    const input = event.target as HTMLInputElement;

    // Eliminar cualquier carácter que no sea número
    const valor = input.value.replace(/[^0-9]/g, '');

    // Actualizar visualmente
    input.value = valor;

    // Actualizar el FormControl
    this.retiroForm.patchValue(
      { numeroCuenta: valor },
      { emitEvent: false }
    );
  }

  // Búsqueda de la cuenta
  buscarCuenta() {
    const numeroCuenta = this.retiroForm.get('numeroCuenta')?.value;

    if (!numeroCuenta) {
      this.mostrarModal('error', 'Error', 'Por favor ingrese un número de cuenta');
      return;
    }

    this.retiroService.buscarCuenta({ numeroCuenta }).subscribe({
      next: (response) => {
        if (response.existe && response.datos) {
          this.cuentaEncontrada = true;
          this.idCuenta = response.datos.idCuenta;

          const tipoTitular = response.datos.idCliente
            ? 'Natural'
            : 'Juridica';
          this.datosComprobante.tipoTitular = tipoTitular;

          this.retiroForm.get('montoRetirar')?.enable();

          this.retiroForm.patchValue({
            numeroDocumento: response.datos.numeroDocumento,
            titular: response.datos.titular,
            saldoDisponible: `$${response.datos.saldo.toLocaleString()}`
          });

          this.mostrarModal('success', 'Éxito', response.mensaje);
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

  onRetirar() {
    if (this.retiroForm.invalid || !this.cuentaEncontrada) {
      this.mostrarModal('error', 'Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    const numeroDocumento = this.retiroForm.get('numeroDocumento')?.value;
    const montoRetirar = this.retiroForm.get('montoRetirar')?.value;
    const numeroCuenta = this.retiroForm.get('numeroCuenta')?.value;
    const titular = this.retiroForm.get('titular')?.value;

    // Validar monto máximo
    const monto = parseFloat(montoRetirar);
    if (monto > this.MONTO_MAXIMO) {
      this.mostrarModal('error', 'Error', '⚠️ El valor máximo permitido es $9,999,999,999,999');
      return;
    }

    const datosRetiro = {
      idCuenta: this.idCuenta,
      numeroDocumento: numeroDocumento,
      montoRetirar: monto
    };

    this.retiroService.procesarRetiro(datosRetiro).subscribe({
      next: (response) => {
        if (response.exito && response.datos) {
          this.mostrarModal(
            'success',
            'Éxito',
            `${response.mensaje}\n\nSaldo anterior: $${response.datos.saldoAnterior.toLocaleString()}\nMonto retirado: $${response.datos.montoRetirado.toLocaleString()}\nSaldo nuevo: $${response.datos.saldoNuevo.toLocaleString()}`
          );
          this.datosComprobante = {
            idTransaccion: response.datos.idTransaccion,
            numeroCuenta,
            numeroDocumento: response.datos.numeroDocumento || numeroDocumento,
            titular: response.datos.nombreTitular || titular,
            montoRetirado: response.datos.montoRetirado,
            saldoAnterior: response.datos.saldoAnterior,
            saldoNuevo: response.datos.saldoNuevo,
            fecha: new Date(response.datos.fechaTransaccion),
            tipoTitular:
              response.datos.tipoCuenta || this.datosComprobante.tipoTitular
          };

          this.retiroRealizado = true;
        } else {
          this.mostrarModal('error', 'Error', response.mensaje);
        }
      },
      error: (error) => {
        console.error('Error al procesar retiro:', error);
        this.mostrarModal('error', 'Error', 'Error al procesar el retiro. Intente nuevamente.');
      }
    });
  }

  // Impresión del comprobante
  imprimirComprobante() {
    window.print();
  }

  // Limpieza del formulario
  limpiarFormulario() {
    this.retiroForm.reset();
    this.cuentaEncontrada = false;
    this.idCuenta = 0;
    this.retiroRealizado = false;

    this.retiroForm.get('numeroDocumento')?.disable();
    this.retiroForm.get('titular')?.disable();
    this.retiroForm.get('saldoDisponible')?.disable();
    this.retiroForm.get('montoRetirar')?.disable();
  }

  limpiarDatosCuenta() {
    this.cuentaEncontrada = false;
    this.idCuenta = 0;
    this.retiroForm.get('montoRetirar')?.disable();

    this.datosComprobante.tipoTitular = 'Natural';

    this.retiroForm.patchValue({
      numeroDocumento: '',
      titular: '',
      saldoDisponible: ''
    });
  }

  onCancelar() {
    this.retiroForm.reset();
    this.limpiarDatosCuenta();

    this.retiroForm.get('numeroDocumento')?.disable();
    this.retiroForm.get('titular')?.disable();
    this.retiroForm.get('saldoDisponible')?.disable();
    this.retiroForm.get('montoRetirar')?.disable();
  }

}