import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RetiroService } from '../../services/retiro.service';
import { NotaDebitoService } from '../../services/nota-debito.service';
import { ConfirmModalComponent, ConfirmModalType } from '../../../../shared/components/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-nota-debito',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent],
  templateUrl: './nota-debito.component.html',
  styleUrls: ['./nota-debito.component.css']
})
export class NotaDebitoComponent {
  notaDebitoForm: FormGroup;
  cuentaEncontrada = false;
  idCuenta: number = 0;
  notaDebitoRealizada = false;

  readonly MONTO_MAXIMO = 9999999999999;
  readonly MONTO_MINIMO = 1;
  readonly MAX_DIGITOS = 13;

  datosComprobante = {
    idTransaccion: 0,
    numeroCuenta: '',
    numeroDocumento: '',
    titular: '',
    valor: 0,
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
  private pendingAction: (() => void) | null = null;

  constructor(
    private fb: FormBuilder,
    private retiroService: RetiroService,
    private notaDebitoService: NotaDebitoService
  ) {
    this.notaDebitoForm = this.fb.group({
      numeroCuenta: ['', [Validators.required]],
      numeroDocumento: [{ value: '', disabled: true }],
      titular: [{ value: '', disabled: true }],
      saldoDisponible: [{ value: '', disabled: true }],
      valor: [{ value: '', disabled: true }, [Validators.required, Validators.min(this.MONTO_MINIMO)]]  // ✅ disabled
    });
  }

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
    this.notaDebitoForm.patchValue({ valor: numero }, { emitEvent: false });

    // 4. Formatear con puntos cada 3 dígitos desde la derecha
    const valorFormateado = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // 5. Actualizar el input visual con el formato (sobrescribe el binding del form)
    input.value = valorFormateado;
  }

  onInputNumeroCuenta(event: Event) {
    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/[^0-9]/g, '');

    this.notaDebitoForm.patchValue({
      numeroCuenta: input.value
    });
  }

  // Búsqueda de la cuenta
  buscarCuenta() {
    const numeroCuenta = this.notaDebitoForm.get('numeroCuenta')?.value;
    if (!numeroCuenta) {
      this.mostrarModal('Error', 'Por favor ingrese un número de cuenta.', 'error');
      return;
    }

    this.retiroService.buscarCuenta({ numeroCuenta }).subscribe({
      next: (response) => {
        if (response.existe && response.datos) {
          this.cuentaEncontrada = true;
          this.idCuenta = response.datos.idCuenta;

          const tipoTitular =
            response.datos.idCliente
              ? 'Natural'
              : 'Juridica';

          this.datosComprobante.tipoTitular = tipoTitular;

          // Habilitar campo valor
          this.notaDebitoForm.get('valor')?.enable();

          this.notaDebitoForm.patchValue({
            numeroDocumento: response.datos.numeroDocumento,
            titular: response.datos.titular,
            saldoDisponible: `$${response.datos.saldo.toLocaleString('es-CO')}`
          });
          this.mostrarModal('Éxito', response.mensaje, 'success');
        } else {
          this.mostrarModal('Error', response.mensaje, 'error');
          this.limpiarDatosCuenta();
        }
      },
      error: (error) => {
        console.error('Error al buscar cuenta:', error);
        this.mostrarModal('Error', 'Error al buscar la cuenta. Intente nuevamente.', 'error');
        this.limpiarDatosCuenta();
      }
    });
  }

  onAplicarNotaDebito() {
    if (this.notaDebitoForm.invalid || !this.cuentaEncontrada) {
      this.mostrarModal('Error', 'Por favor complete todos los campos requeridos', 'error');
      return;
    }

    const numeroDocumento = this.notaDebitoForm.get('numeroDocumento')?.value;
    const valor = this.notaDebitoForm.get('valor')?.value;
    const numeroCuenta = this.notaDebitoForm.get('numeroCuenta')?.value;
    const titular = this.notaDebitoForm.get('titular')?.value;
    const monto = parseFloat(valor);

    if (monto > this.MONTO_MAXIMO) {
      this.mostrarModal('Error', '⚠️ El valor máximo permitido es $9,999,999,999,999', 'error');
      return;
    }

    const datosNotaDebito = {
      idCuenta: this.idCuenta,
      numeroDocumento: numeroDocumento,
      valor: monto
    };

    this.notaDebitoService.aplicarNotaDebito(datosNotaDebito).subscribe({
      next: (response) => {
        if (response.exito && response.datos) {
          alert(`✅ ${response.mensaje}\n\nSaldo anterior: $${response.datos.saldoAnterior.toLocaleString()}\nValor debitado: $${response.datos.valor.toLocaleString()}\nSaldo nuevo: $${response.datos.saldoNuevo.toLocaleString()}`);

          this.datosComprobante = {
            idTransaccion: response.datos.idTransaccion,
            numeroCuenta,
            numeroDocumento:
              response.datos.numeroDocumento || numeroDocumento,
            titular:
              response.datos.nombreTitular || titular,
            valor: response.datos.valor,
            saldoAnterior: response.datos.saldoAnterior,
            saldoNuevo: response.datos.saldoNuevo,
            fecha: new Date(response.datos.fechaTransaccion),
            tipoTitular:
              response.datos.tipoCuenta ||
              this.datosComprobante.tipoTitular
          };

          this.notaDebitoRealizada = true;
        } else {
          this.mostrarModal('Error', response.mensaje, 'error');
        }
      },
      error: (error) => {
        console.error('Error al aplicar nota débito:', error);
        this.mostrarModal('Error', 'Error al aplicar la nota débito. Intente nuevamente.', 'error');
      }
    });
  }

  // Impresión del comprobante
  imprimirComprobante() {
    window.print();
  }

  // Limpieza del formulario
  limpiarFormulario() {
    this.notaDebitoForm.reset();
    this.cuentaEncontrada = false;
    this.idCuenta = 0;
    this.notaDebitoRealizada = false;

    // Re-deshabilitar campos
    this.notaDebitoForm.get('numeroDocumento')?.disable();
    this.notaDebitoForm.get('titular')?.disable();
    this.notaDebitoForm.get('saldoDisponible')?.disable();
    this.notaDebitoForm.get('valor')?.disable();
    this.datosComprobante.tipoTitular = 'Natural';
  }

  limpiarDatosCuenta() {
    this.cuentaEncontrada = false;
    this.idCuenta = 0;

    // Deshabilitar campo valor
    this.notaDebitoForm.get('valor')?.disable();

    this.notaDebitoForm.patchValue({
      numeroDocumento: '',
      titular: '',
      saldoDisponible: '',
      valor: ''
    });
  }

  onCancelar() {
    this.notaDebitoForm.reset();
    this.limpiarDatosCuenta();

    // Re-deshabilitar campos
    this.notaDebitoForm.get('numeroDocumento')?.disable();
    this.notaDebitoForm.get('titular')?.disable();
    this.notaDebitoForm.get('saldoDisponible')?.disable();
    this.notaDebitoForm.get('valor')?.disable();
  }

  onConfirmModal(): void {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
  }

}