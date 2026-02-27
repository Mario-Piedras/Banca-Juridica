import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RetiroService } from '../../services/retiro.service';
import { CancelacionService } from '../../services/cancelacion.service';

@Component({
  selector: 'app-cancelacion-cuenta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    fecha: new Date()
  };

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

  buscarCuenta() {
    const numeroCuenta = this.cancelacionForm.get('numeroCuenta')?.value;
    if (!numeroCuenta) {
      alert('Por favor ingrese un número de cuenta');
      return;
    }

    this.retiroService.buscarCuenta({ numeroCuenta }).subscribe({
      next: (response) => {
        if (response.existe && response.datos) {
          this.cuentaEncontrada = true;
          this.idCuenta = response.datos.idCuenta;

          // Agregar estas líneas para deshabilitar campos después de buscar
          this.cancelacionForm.get('numeroDocumento')?.disable();
          this.cancelacionForm.get('titular')?.disable();
          this.cancelacionForm.get('saldoDisponible')?.disable();

          this.cancelacionForm.patchValue({
            numeroDocumento: response.datos.numeroDocumento,
            titular: response.datos.titular,
            saldoDisponible: `$${response.datos.saldo.toLocaleString('es-CO')}`
          });

          // Validar saldo
          if (response.datos.saldo !== 0) {
            alert(`⚠️ ADVERTENCIA\n\nLa cuenta tiene saldo: $${response.datos.saldo.toLocaleString('es-CO')}\n\nPara cancelar la cuenta, el saldo debe ser $0.\nRealice retiros o transferencias hasta dejar el saldo en cero.`);
          }

          alert(response.mensaje);
        } else {
          alert(response.mensaje);
          this.limpiarDatosCuenta();
        }
      },
      error: (error) => {
        console.error('Error al buscar cuenta:', error);
        alert('Error al buscar la cuenta. Intente nuevamente.');
        this.limpiarDatosCuenta();
      }
    });
  }


  onCancelarCuenta() {
    // Solo validar que la cuenta esté encontrada
    if (!this.cuentaEncontrada) {
      alert('Por favor busque una cuenta válida');
      return;
    }

    const numeroCuenta = this.cancelacionForm.get('numeroCuenta')?.value;
    const numeroDocumento = this.cancelacionForm.get('numeroDocumento')?.value;
    const motivoCancelacion = this.cancelacionForm.get('motivoCancelacion')?.value?.trim() || '';
    const titular = this.cancelacionForm.get('titular')?.value;

    // Confirmar cancelación
    const confirmar = confirm(
      `⚠️ CONFIRMACIÓN DE CANCELACIÓN\n\n` +
      `Cuenta: ${numeroCuenta}\n` +
      `Titular: ${titular}\n` +
      `Documento: ${numeroDocumento}\n\n` +
      `¿Está seguro de cancelar esta cuenta?\n` +
      `Esta acción NO se puede deshacer.`
    );

    if (!confirmar) return;

    const datosCancelacion = {
      numeroCuenta: numeroCuenta,
      numeroDocumento: numeroDocumento,
      motivoCancelacion: motivoCancelacion  // ✅ Puede estar vacío
    };

    this.cancelacionService.cancelarCuenta(datosCancelacion).subscribe({
      next: (response) => {
        if (response.exito && response.datos) {
          alert(`${response.mensaje}\n\nLa cuenta ha sido cerrada permanentemente.`);

          this.datosComprobante = {
            idCuenta: response.datos.idCuenta,
            numeroCuenta: numeroCuenta,
            numeroDocumento: numeroDocumento,
            titular: titular,
            saldoFinal: response.datos.saldoFinal,
            motivoCancelacion: response.datos.motivoCancelacion,
            fecha: new Date(response.datos.fechaCancelacion)
          };

          this.cancelacionRealizada = true;
        } else {
          alert(response.mensaje);
        }
      },
      error: (error) => {
        console.error('Error al cancelar cuenta:', error);
        alert('Error al cancelar la cuenta. Intente nuevamente.');
      }
    });
  }

  imprimirComprobante() {
    window.print();
  }

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
}
