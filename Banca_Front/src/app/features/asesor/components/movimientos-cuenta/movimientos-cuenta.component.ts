import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MovimientosCuentaService } from '../../services/movimientos-cuenta.service';
import { ConfirmModalComponent } from '../../../../shared/components/modals/confirm-modal/confirm-modal.component';

@Component({
    selector: 'app-movimientos-cuenta',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent],
    templateUrl: './movimientos-cuenta.component.html',
    styleUrls: ['./movimientos-cuenta.component.css'],
})
export class MovimientosCuentaComponent {
    form: FormGroup;
    cuentaEncontrada = false;
    tipoTitular = 'Natural';
    movimientos: any[] = [];

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
    modalType: 'success' | 'error' | 'confirm' = 'success';
    modalConfirmText = 'Aceptar';
    private pendingAction: (() => void) | null = null;

    constructor(
        private fb: FormBuilder,
        private movimientosService: MovimientosCuentaService
    ) {
        this.form = this.fb.group({
            numeroCuenta: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^[0-9]+$/)
                ]
            ],
            titular: [
                {
                    value: '',
                    disabled: true
                }
            ],
            numeroDocumento: [
                {
                    value: '',
                    disabled: true
                }
            ]
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

    onInputNumeroCuenta(event: Event) {
        const input = event.target as HTMLInputElement;

        // Eliminar cualquier carácter que no sea número
        const valor = input.value.replace(/[^0-9]/g, '');

        // Actualizar visualmente
        input.value = valor;

        // Actualizar el FormControl
        this.form.patchValue(
            { numeroCuenta: valor },
            { emitEvent: false }
        );
    }

    // Búsqueda de la cuenta
    buscarCuenta() {
        if (this.form.invalid) {
            this.mostrarModal('Error', 'Por favor ingrese un número de cuenta', 'error');
            return;
        }

        const numeroCuenta = this.form.get('numeroCuenta')?.value;
        this.movimientosService.buscarCuenta(numeroCuenta).subscribe({
            next: (response) => {
                if (
                    response.existe
                ) {

                    this.mostrarModal(
                        'Éxito',
                        'La cuenta fue encontrada correctamente.',
                        'success',
                        'Aceptar',
                        () => {
                            this.cuentaEncontrada = true;
                            this.tipoTitular = response.datos.tipoTitular;

                            this.form.patchValue({
                                titular: response.datos.titular,
                                numeroDocumento: response.datos.numeroDocumento
                            });

                            this.consultarMovimientos(numeroCuenta);
                        }
                    );
                } else {
                    this.mostrarModal('Error', response.mensaje, 'error');

                }

            },

            error: (
                err
            ) => {

                this.mostrarModal(
                    'Error',
                    err.error?.mensaje || 'Error al buscar la cuenta.',
                    'error'
                );

            }

        });

    }

    // Consulta de los movimientos
    consultarMovimientos(
        numeroCuenta: string
    ) {
        this.movimientosService.consultarMovimientos(numeroCuenta).subscribe({
            next: (resp) => {
                this.movimientos =
                    resp.movimientos;
            },
            error: () => {
                this.mostrarModal(
                    'Error',
                    'Error consultando los movimientos de la cuenta.',
                    'error'
                );
            }
        });
    }

    obtenerClaseMonto(
        tipo: string,
        monto: number
    ) {
        if (monto === 0) {
            return 'text-gray-700';
        }
        if (
            tipo === 'Apertura'
            ||
            tipo === 'Depósito'
        ) {
            return 'text-green-600 font-semibold';
        }
        if (
            tipo === 'Retiro'
            ||
            tipo === 'Nota Débito'
        ) {
            return 'text-red-500 font-semibold';
        }
        return 'text-gray-700';
    }

    onCancelar() {
        this.form.reset();
        this.movimientos = [];
        this.cuentaEncontrada = false;
        this.tipoTitular = 'Natural';
    }

    onConfirmModal(): void {
        if (this.pendingAction) {
            this.pendingAction();
            this.pendingAction = null;
        }
    }

}