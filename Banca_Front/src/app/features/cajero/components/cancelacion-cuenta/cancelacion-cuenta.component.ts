import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RetiroService } from '../../services/retiro.service';
import { CancelacionService } from '../../services/cancelacion.service';
import { ConfirmModalComponent, ConfirmModalType } from '../../../../shared/components/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-cancelacion-cuenta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent],
  templateUrl: './cancelacion-cuenta.component.html',
  styleUrls: ['./cancelacion-cuenta.component.css']
})
export class CancelacionCuentaComponent {
  cancelacionForm: FormGroup;
  cuentaEncontrada = false;
  idCuenta: number = 0;
  cancelacionRealizada = false;

  datosComprobante = {
    idCuenta: 0,
    numeroCuenta: '',
    numeroDocumento: '',
    titular: '',
    saldoFinal: 0,
    motivoCancelacion: '',
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
    private retiroService: RetiroService,
    private cancelacionService: CancelacionService
  ) {
    this.cancelacionForm = this.fb.group({
      numeroCuenta: ['', [Validators.required]],
      numeroDocumento: [{ value: '', disabled: true }],
      titular: [{ value: '', disabled: true }],
      saldoDisponible: [{ value: '', disabled: true }],
      motivoCancelacion: ['']  // SIN Validators.required
    });
  }

  esConfirmacionCancelacion = false;

  private mostrarModal(type: ConfirmModalType, title: string, message: string): void {
    this.esConfirmacionCancelacion = false;
    this.modalType = type;
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalConfirmText = 'Aceptar';
    this.modalVisible = true;
  }

  // Búsqueda de la cuenta
  buscarCuenta() {
    const numeroCuenta = this.cancelacionForm.get('numeroCuenta')?.value;
    if (!numeroCuenta) {
      this.mostrarModal('error', 'Error', 'Por favor ingrese un número de cuenta');
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

          // Agregar estas líneas para deshabilitar campos después de buscar
          this.cancelacionForm.get('numeroDocumento')?.disable();
          this.cancelacionForm.get('titular')?.disable();
          this.cancelacionForm.get('saldoDisponible')?.disable();

          this.cancelacionForm.patchValue({
            numeroDocumento: response.datos.numeroDocumento,
            titular: response.datos.titular,
            saldoDisponible: `$${response.datos.saldo.toLocaleString('es-CO')}`
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

  onCancelarCuenta() {
    // Solo validar que la cuenta esté encontrada
    if (!this.cuentaEncontrada) {
      this.mostrarModal('error', 'Error', 'Por favor busque una cuenta válida');
      return;
    }

    const numeroCuenta = this.cancelacionForm.get('numeroCuenta')?.value;
    const numeroDocumento = this.cancelacionForm.get('numeroDocumento')?.value;
    const motivoCancelacion = this.cancelacionForm.get('motivoCancelacion')?.value?.trim() || '';
    const titular = this.cancelacionForm.get('titular')?.value;

    // Confirmar cancelación
    this.esConfirmacionCancelacion = true;

    this.modalType = 'confirm';
    this.modalTitle = 'Confirmar cancelación';
    this.modalMessage =
      `Cuenta: ${numeroCuenta}\n` +
      `Titular: ${titular}\n` +
      `Documento: ${numeroDocumento}\n\n` +
      `¿Está seguro de cancelar esta cuenta?\n` +
      `Esta acción NO se puede deshacer.`;

    this.modalConfirmText = 'Sí, cancelar';
    this.modalVisible = true;

  }

  // Impresión del comprobante
  imprimirComprobante() {
    window.print();
  }

  // Limpieza del formulario
  limpiarFormulario() {
    this.cancelacionForm.reset();
    this.cuentaEncontrada = false;
    this.idCuenta = 0;
    this.cancelacionRealizada = false;

    // Re-deshabilitar campos
    this.cancelacionForm.get('numeroDocumento')?.disable();
    this.cancelacionForm.get('titular')?.disable();
    this.cancelacionForm.get('saldoDisponible')?.disable();
  }

  limpiarDatosCuenta() {
    this.cuentaEncontrada = false;
    this.idCuenta = 0;

    // ✅ Re-deshabilitar campos
    this.cancelacionForm.get('numeroDocumento')?.disable();
    this.cancelacionForm.get('titular')?.disable();
    this.cancelacionForm.get('saldoDisponible')?.disable();

    this.cancelacionForm.patchValue({
      numeroDocumento: '',
      titular: '',
      saldoDisponible: ''
    });
  }

  onCancelar() {
    this.cancelacionForm.reset();
    this.limpiarDatosCuenta();
  }

  onConfirmModal(): void {
    if (!this.esConfirmacionCancelacion) {
      return;
    }

    this.esConfirmacionCancelacion = false;

    const numeroCuenta = this.cancelacionForm.get('numeroCuenta')?.value;
    const numeroDocumento = this.cancelacionForm.get('numeroDocumento')?.value;
    const motivoCancelacion = this.cancelacionForm.get('motivoCancelacion')?.value?.trim() || '';
    const titular = this.cancelacionForm.get('titular')?.value;

    const datosCancelacion = {
      numeroCuenta: numeroCuenta,
      numeroDocumento: numeroDocumento,
      motivoCancelacion: motivoCancelacion  // ✅ Puede estar vacío
    };

    this.cancelacionService.cancelarCuenta(datosCancelacion).subscribe({
      next: (response) => {
        if (response.exito && response.datos) {
          this.mostrarModal('success', 'Éxito', `${response.mensaje}\n\nLa cuenta ha sido cerrada permanentemente.`);

          this.datosComprobante = {
            idCuenta: response.datos.idCuenta,
            numeroCuenta: numeroCuenta,
            numeroDocumento: numeroDocumento,
            titular: titular,
            saldoFinal: response.datos.saldoFinal,
            motivoCancelacion: response.datos.motivoCancelacion,
            fecha: new Date(response.datos.fechaCancelacion),
            tipoTitular: this.datosComprobante.tipoTitular
          };

          this.cancelacionRealizada = true;
        } else {
          this.mostrarModal('error', 'Error', response.mensaje);
        }
      },
      error: (error) => {
        console.error('Error al cancelar cuenta:', error);
        this.mostrarModal('error', 'Error', 'Error al cancelar la cuenta. Intente nuevamente.');
      }
    });

  }

}