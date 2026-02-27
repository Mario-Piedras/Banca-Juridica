import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrasladoService } from '../../services/traslado.service';
import { AuthService } from '../../../../core/services/auth.service'; // ← NUEVO: Importar AuthService

@Component({
  selector: 'app-traslado-cajero',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './traslado-cajero.component.html',
  styleUrls: ['./traslado-cajero.component.css']
})
export class TrasladoCajeroComponent {
  trasladoForm: FormGroup;
  trasladoRealizado = false;
  readonly MONTO_MAXIMO = 9999999999999;
  readonly MONTO_MINIMO = 1;
  readonly MAX_DIGITOS = 13;

  // ✅ CORREGIDO: Obtener cajero actual del usuario autenticado
  cajeroActual = '';

  cajerosDestino = [
    'Caja 1',
    'Caja 2',
    'Caja 3',
    'Caja 4',
    'Caja 5',
    'Caja Principal'
  ];

  datosComprobante = {
    idTraslado: 0,
    cajeroOrigen: '',
    cajeroDestino: '',
    monto: 0,
    fecha: new Date()
  };

  constructor(
    private fb: FormBuilder,
    private trasladoService: TrasladoService,
    private authService: AuthService  // ← NUEVO: Inyectar AuthService
  ) {
    // ✅ CORREGIDO: Obtener cajero actual del usuario autenticado
    const currentUser = this.authService.currentUserValue;
    this.cajeroActual = currentUser?.nombre_caja || 'Cajero 01';

    this.trasladoForm = this.fb.group({
      cajeroDestino: ['', [Validators.required]],
      monto: ['', [Validators.required, Validators.min(this.MONTO_MINIMO)]]
    });
  }

  onInputMonto(event: Event) {
    const input = event.target as HTMLInputElement;

    let valor = input.value.replace(/\./g, '').replace(/[^0-9]/g, '');

    if (valor.length > this.MAX_DIGITOS) {
      valor = valor.substring(0, this.MAX_DIGITOS);
    }

    const numero = valor ? Number(valor) : 0;
    this.trasladoForm.patchValue({ monto: numero }, { emitEvent: false });

    const valorFormateado = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = valorFormateado;
  }

  onEnviarTraslado() {
    if (this.trasladoForm.invalid) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const cajeroDestino = this.trasladoForm.get('cajeroDestino')?.value;
    const monto = this.trasladoForm.get('monto')?.value;

    if (this.cajeroActual === cajeroDestino) {
      alert('⚠️ No puede enviar dinero a sí mismo');
      return;
    }

    const montoNumero = parseFloat(monto);
    if (montoNumero > this.MONTO_MAXIMO) {
      alert(`⚠️ El monto máximo permitido es $9,999,999,999,999`);
      return;
    }

    const confirmar = confirm(
      `¿Confirma el envío de traslado?\n\n` +
      `De: ${this.cajeroActual}\n` +
      `Para: ${cajeroDestino}\n` +
      `Monto: $${montoNumero.toLocaleString()}\n\n` +
      `Su saldo disminuirá inmediatamente.`
    );

    if (!confirmar) {
      return;
    }

    const datosTraslado = {
      cajeroOrigen: this.cajeroActual,
      cajeroDestino: cajeroDestino,
      monto: montoNumero
    };

    this.trasladoService.enviarTraslado(datosTraslado).subscribe({
      next: (response) => {
        if (response.exito && response.datos) {
          alert(`${response.mensaje}\n\nEl ${cajeroDestino} debe aceptar el traslado para recibir el dinero.`);
          this.datosComprobante = {
            idTraslado: response.datos.idTraslado,
            cajeroOrigen: this.cajeroActual,
            cajeroDestino: cajeroDestino,
            monto: montoNumero,
            fecha: new Date(response.datos.fechaEnvio)
          };
          this.trasladoRealizado = true;
        } else {
          alert(response.mensaje);
        }
      },
      error: (error) => {
        console.error('Error al enviar traslado:', error);
        alert('Error al enviar el traslado. Intente nuevamente.');
      }
    });
  }

  imprimirComprobante() {
    window.print();
  }

  limpiarFormulario() {
    this.trasladoForm.reset();
    this.trasladoRealizado = false;
  }

  onCancelar() {
    this.trasladoForm.reset();
  }
}
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { TrasladoService } from '../../services/traslado.service';

// @Component({
//   selector: 'app-traslado-cajero',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './traslado-cajero.component.html',
//   styleUrls: ['./traslado-cajero.component.css']
// })
// export class TrasladoCajeroComponent {
//   trasladoForm: FormGroup;
//   trasladoRealizado = false;
//   readonly MONTO_MAXIMO = 9999999999999;
//   readonly MONTO_MINIMO = 1;
//   readonly MAX_DIGITOS = 13;

//   // Cajero fijo del usuario actual
//   cajeroActual = 'Cajero 01'; // ← CAMBIAR SEGÚN TU SISTEMA

//   // Lista de cajeros disponibles para destino
//   cajerosDestino = [
//     'Cajero 01',
//     'Cajero 02',
//     'Cajero 03',
//     'Cajero 04',
//     'Cajero 05',
//     'Cajero Principal'
//   ];

//   datosComprobante = {
//     idTraslado: 0,
//     cajeroOrigen: '',
//     cajeroDestino: '',
//     monto: 0,
//     fecha: new Date()
//   };

//   constructor(
//     private fb: FormBuilder,
//     private trasladoService: TrasladoService
//   ) {
//     this.trasladoForm = this.fb.group({
//       cajeroDestino: ['', [Validators.required]],
//       monto: ['', [Validators.required, Validators.min(this.MONTO_MINIMO)]]
//     });
//   }

//   onInputMonto(event: Event) {
//     const input = event.target as HTMLInputElement;

//     // 1. Remover puntos existentes y otros caracteres no numéricos
//     let valor = input.value.replace(/\./g, '').replace(/[^0-9]/g, '');

//     // 2. Limitar a 13 dígitos
//     if (valor.length > this.MAX_DIGITOS) {
//       valor = valor.substring(0, this.MAX_DIGITOS);
//     }

//     // 3. Convertir a número para el form (para validaciones)
//     const numero = valor ? Number(valor) : 0;
//     this.trasladoForm.patchValue({ monto: numero }, { emitEvent: false });

//     // 4. Formatear con puntos cada 3 dígitos desde la derecha
//     const valorFormateado = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

//     // 5. Actualizar el input visual con el formato (sobrescribe el binding del form)
//     input.value = valorFormateado;
//   }

//   onEnviarTraslado() {
//     if (this.trasladoForm.invalid) {
//       alert('Por favor complete todos los campos requeridos');
//       return;
//     }

//     const cajeroDestino = this.trasladoForm.get('cajeroDestino')?.value;
//     const monto = this.trasladoForm.get('monto')?.value;

//     if (this.cajeroActual === cajeroDestino) {
//       alert('⚠️ No puede enviar dinero a sí mismo');
//       return;
//     }

//     const montoNumero = parseFloat(monto);
//     if (montoNumero > this.MONTO_MAXIMO) {
//       alert(`⚠️ El monto máximo permitido es $9,999,999,999,999`);
//       return;
//     }

//     const confirmar = confirm(
//       `¿Confirma el envío de traslado?\n\n` +
//       `De: ${this.cajeroActual}\n` +
//       `Para: ${cajeroDestino}\n` +
//       `Monto: $${montoNumero.toLocaleString()}\n\n` +
//       `Su saldo disminuirá inmediatamente.`
//     );

//     if (!confirmar) {
//       return;
//     }

//     const datosTraslado = {
//       cajeroOrigen: this.cajeroActual,
//       cajeroDestino: cajeroDestino,
//       monto: montoNumero
//     };

//     this.trasladoService.enviarTraslado(datosTraslado).subscribe({
//       next: (response) => {
//         if (response.exito && response.datos) {
//           alert(`${response.mensaje}\n\nEl ${cajeroDestino} debe aceptar el traslado para recibir el dinero.`);
//           this.datosComprobante = {
//             idTraslado: response.datos.idTraslado,
//             cajeroOrigen: this.cajeroActual,
//             cajeroDestino: cajeroDestino,
//             monto: montoNumero,
//             fecha: new Date(response.datos.fechaEnvio)
//           };
//           this.trasladoRealizado = true;
//         } else {
//           alert(response.mensaje);
//         }
//       },
//       error: (error) => {
//         console.error('Error al enviar traslado:', error);
//         alert('Error al enviar el traslado. Intente nuevamente.');
//       }
//     });
//   }

//   imprimirComprobante() {
//     window.print();
//   }

//   limpiarFormulario() {
//     this.trasladoForm.reset();
//     this.trasladoRealizado = false;
//   }

//   onCancelar() {
//     this.trasladoForm.reset();
//   }
// }
