import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RetiroService } from '../../services/retiro.service';
import { ConsignacionService } from '../../services/consignacion.service';

@Component({
  selector: 'app-consignacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    nombreCajero: ''
  };

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

  buscarCuenta() {
    const numeroCuenta = this.consignacionForm.get('numeroCuenta')?.value;
    if (!numeroCuenta) {
      alert('Por favor ingrese un número de cuenta');
      return;
    }

    this.retiroService.buscarCuenta({ numeroCuenta }).subscribe({
      next: (response) => {
        if (response.existe && response.datos) {
          this.cuentaEncontrada = true;
          this.idCuenta = response.datos.idCuenta;

          // Habilitar campos cuando se encuentra la cuenta
          this.consignacionForm.get('tipoConsignacion')?.enable();
          this.consignacionForm.get('valor')?.enable();

          this.consignacionForm.patchValue({
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

  onProcesarConsignacion() {
    if (this.consignacionForm.invalid || !this.cuentaEncontrada) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const numeroCuenta = this.consignacionForm.get('numeroCuenta')?.value;
    const tipoConsignacion = this.consignacionForm.get('tipoConsignacion')?.value;
    const valor = this.consignacionForm.get('valor')?.value;
    const titular = this.consignacionForm.get('titular')?.value;
    const numeroDocumento = this.consignacionForm.get('numeroDocumento')?.value;
    const monto = parseFloat(valor);

    if (monto > this.MONTO_MAXIMO) {
      alert(`⚠️ El valor máximo permitido es $9,999,999,999,999`);
      return;
    }

    if (tipoConsignacion === 'Cheque') {
      const codigoCheque = this.consignacionForm.get('codigoCheque')?.value;
      const numeroCheque = this.consignacionForm.get('numeroCheque')?.value;

      if (!codigoCheque || !numeroCheque) {
        alert('⚠️ Para consignación con cheque debe ingresar código y número de cheque');
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
          alert(`✅ ${response.mensaje}\n\nSaldo anterior: $${response.datos.saldoAnterior.toLocaleString()}\nValor consignado: $${response.datos.valorConsignado.toLocaleString()}\nSaldo nuevo: $${response.datos.saldoNuevo.toLocaleString()}`);

          this.datosComprobante = {
            idTransaccion: response.datos.idTransaccion,
            numeroCuenta: numeroCuenta,
            numeroDocumento: numeroDocumento,
            titular: titular,
            valorConsignado: response.datos.valorConsignado,
            tipoConsignacion: tipoConsignacion,
            codigoCheque: response.datos.codigoCheque || '',
            numeroCheque: response.datos.numeroCheque || '',
            saldoAnterior: response.datos.saldoAnterior,
            saldoNuevo: response.datos.saldoNuevo,
            fecha: new Date(response.datos.fechaTransaccion),
            nombreCajero: this.datosComprobante.nombreCajero
          };

          this.consignacionRealizada = true;
        } else {
          alert(response.mensaje);
        }
      },
      error: (error) => {
        console.error('Error al procesar consignación:', error);
        alert('Error al procesar la consignación. Intente nuevamente.');
      }
    });
  }

  imprimirComprobante() {
    window.print();
  }

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
}
