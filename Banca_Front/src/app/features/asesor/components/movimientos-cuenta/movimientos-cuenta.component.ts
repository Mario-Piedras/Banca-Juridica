import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

import { MovimientosCuentaService } from '../../services/movimientos-cuenta.service';

@Component({
    selector: 'app-movimientos-cuenta',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './movimientos-cuenta.component.html'
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

    buscarCuenta() {

        if (this.form.invalid) {

            alert(
                'Ingrese una cuenta válida'
            );

            return;

        }

        const numeroCuenta =
            this.form
                .get(
                    'numeroCuenta'
                )
                ?.value;

        this.movimientosService
            .buscarCuenta(
                numeroCuenta
            )
            .subscribe({

                next: (
                    response
                ) => {

                    if (
                        response.existe
                    ) {

                        this.cuentaEncontrada =
                            true;

                        this.tipoTitular =
                            response
                                .datos
                                .tipoTitular;

                        this.form.patchValue({

                            titular:
                                response
                                    .datos
                                    .titular,

                            numeroDocumento:
                                response
                                    .datos
                                    .numeroDocumento

                        });

                        this.consultarMovimientos(
                            numeroCuenta
                        );

                    } else {

                        alert(
                            response
                                .mensaje
                        );

                    }

                },

                error: (
                    err
                ) => {

                    alert(
                        err
                        .error
                        ?.mensaje
                        ||
                        'Error'
                    );

                }

            });

    }

    consultarMovimientos(
        numeroCuenta: string
    ) {
        this.movimientosService.consultarMovimientos(numeroCuenta).subscribe({
            next: (resp) => {
                this.movimientos =
                    resp.movimientos;
            },
            error: () => {
                alert(
                    'Error consultando movimientos'
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
}