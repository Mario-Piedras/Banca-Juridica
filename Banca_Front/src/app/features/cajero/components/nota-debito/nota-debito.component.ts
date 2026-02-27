import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RetiroService } from '../../services/retiro.service';
import { NotaDebitoService } from '../../services/nota-debito.service';

@Component({
  selector: 'app-nota-debito',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    fecha: new Date()
  };

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

  buscarCuenta() {
    const numeroCuenta = this.notaDebitoForm.get('numeroCuenta')?.value;
    if (!numeroCuenta) {
      alert('Por favor ingrese un número de cuenta');
      return;
    }

    this.retiroService.buscarCuenta({ numeroCuenta }).subscribe({
      next: (response) => {
        if (response.existe && response.datos) {
          this.cuentaEncontrada = true;
          this.idCuenta = response.datos.idCuenta;

          // Habilitar campo valor
          this.notaDebitoForm.get('valor')?.enable();

          this.notaDebitoForm.patchValue({
            numeroDocumento: response.datos.numeroDocumento,
            titular: response.datos.titular,
            saldoDisponible: `$${response.datos.saldo.toLocaleString('es-CO')}`
          });
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

  onAplicarNotaDebito() {
    if (this.notaDebitoForm.invalid || !this.cuentaEncontrada) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const numeroDocumento = this.notaDebitoForm.get('numeroDocumento')?.value;
    const valor = this.notaDebitoForm.get('valor')?.value;
    const numeroCuenta = this.notaDebitoForm.get('numeroCuenta')?.value;
    const titular = this.notaDebitoForm.get('titular')?.value;
    const monto = parseFloat(valor);

    if (monto > this.MONTO_MAXIMO) {
      alert(`⚠️ El valor máximo permitido es $9,999,999,999,999`);
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
            numeroCuenta: numeroCuenta,
            numeroDocumento: numeroDocumento,
            titular: titular,
            valor: response.datos.valor,
            saldoAnterior: response.datos.saldoAnterior,
            saldoNuevo: response.datos.saldoNuevo,
            fecha: new Date(response.datos.fechaTransaccion)
          };

          this.notaDebitoRealizada = true;
        } else {
          alert(response.mensaje);
        }
      },
      error: (error) => {
        console.error('Error al aplicar nota débito:', error);
        alert('Error al aplicar la nota débito. Intente nuevamente.');
      }
    });
  }

  imprimirComprobante() {
    window.print();
  }

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
}
