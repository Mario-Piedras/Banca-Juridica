import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs';


@Component({
  selector: 'app-info-fintrib',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './info-fintrib.component.html',
  styleUrls: [
    '../registrar-cliente-juridico.component.css',
    './info-fintrib.component.css'
  ]
})
export class InformacionFinancieraTributariaComponent implements OnInit {
  @Input() datosIniciales: any;
  @Output() formChange = new EventEmitter();
  @Output() prevTab = new EventEmitter<void>();
  @Output() nextTab = new EventEmitter();

  form: FormGroup;
  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      ingresos_op: ['', [
        Validators.required,
        Validators.min(1)
      ]],

      ingresos_no_op: ['', [
        Validators.required,
        Validators.min(1)
      ]],
      detalle_ingresos: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      ventas_anuales: ['', [
        Validators.required,
        Validators.min(1)
      ]],
      fecha_cierre_ventas: ['', [
        Validators.required,
        this.validarFechaNoFutura()
      ]],
      egresos_mensuales: ['', [
        Validators.required,
        Validators.min(1)
      ]],
      utilidad_neta: ['', [
        Validators.required,
        Validators.min(1)
      ]],
      total_activos: ['', [
        Validators.required,
        Validators.min(1)
      ]],
      total_pasivos: ['', [
        Validators.required,
        Validators.min(1)
      ]],
      total_patrimonio: ['', [
        Validators.required,
        Validators.min(1)
      ]],
      tipo_contribuyente: ['', Validators.required],
      clase_contribuyente: ['', Validators.required],
      responsable_iva: ['', Validators.required],
      autorretenedor: ['', Validators.required],
      intermediario_mercado: ['', Validators.required],
      vigilado_superintendencia: ['', Validators.required],
      tributa_exterior: ['', Validators.required],
      paises_exterior: this.fb.array([], Validators.minLength(1))
    });
  }


  ngOnInit() {
    if (this.datosIniciales) {
      // Evitar romper el FormArray cuando viene null / undefined
      if (this.datosIniciales.paises_exterior == null) {
        this.datosIniciales.paises_exterior = [];
      }

      this.form.patchValue(this.datosIniciales);

      // Si vienen paises_exterior, sincronizar el FormArray (patchValue no crea FormGroups)
      const payloadPaises = this.datosIniciales.paises_exterior;
      const arr = this.form.get('paises_exterior') as FormArray;

      arr.clear();
      if (Array.isArray(payloadPaises)) {
        payloadPaises.forEach((p: any) => arr.push(this.crearGrupoPaisTin(p)));
      }
    }

    this.form.get('tributa_exterior')?.valueChanges.subscribe(valor => {
      const paisesArray = this.paisesExterior;

      if (valor === 'Sí') {
        paisesArray.setValidators(Validators.minLength(1));
      } else {
        paisesArray.clear();
        paisesArray.clearValidators();
      }

      paisesArray.updateValueAndValidity();
    });

    this.form.valueChanges.subscribe(valores => {
      this.formChange.emit(valores);
    });

    // Informa los cambios del formulario en la consola
    this.form.statusChanges.subscribe(() => {
      console.log('Formulario válido:', this.form.valid);

      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);

        if (control?.invalid) {
          console.log(key, control.errors);
        }
      })
    });

  }

  validarFechaNoFutura() {
    return (control: any) => {
      if (!control.value) return null;
      const fecha = new Date(control.value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // MEJORA: Ignorar hora
      fecha.setHours(0, 0, 0, 0);
      return fecha <= hoy ? null : { fechaFutura: true };
    };
  }

  private crearGrupoPaisTin(p?: { pais?: string; tin?: string }) {
    return this.fb.group({
      pais: [p?.pais ?? '', [Validators.required, Validators.minLength(1)]],
      tin: [p?.tin ?? '', [Validators.required, Validators.minLength(1)]],
    });
  }

  addPaisExterior() {
    this.paisesExterior.push(this.crearGrupoPaisTin());
  }

  deletePaisExterior(index: number) {
    this.paisesExterior.removeAt(index);
  }

  get paisesExteriorControls(): any[] {
    const arr = this.form.get('paises_exterior') as FormArray | null;
    return (arr?.controls as any[]) ?? [];
  }

  private get paisesExterior(): FormArray {
    return this.form.get('paises_exterior') as FormArray;
  }


  private tributaExteriorEsSi(): boolean {
    const val = this.form.get('tributa_exterior')?.value;
    return val === 'Sí' || val === 'Si';
  }

  // Botón de guardar formulario
  guardarSeccion() {

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = this.form.value;

    const infoFinanciera = {
      ingresos_op: formData.ingresos_op,
      ingresos_no_op: formData.ingresos_no_op,
      detalle_ingresos: formData.detalle_ingresos,
      ventas_anuales: formData.ventas_anuales,
      fecha_cierre_ventas: formData.fecha_cierre_ventas,
      egresos_mensuales: formData.egresos_mensuales,
      utilidad_neta: formData.utilidad_neta,
      total_activos: formData.total_activos,
      total_pasivos: formData.total_pasivos,
      total_patrimonio: formData.total_patrimonio
    };

    const infoTributaria = {
      tipo_contribuyente: formData.tipo_contribuyente,
      clase_contribuyente: formData.clase_contribuyente,
      responsable_iva: formData.responsable_iva,
      autorretenedor: formData.autorretenedor,
      intermediario_mercado: formData.intermediario_mercado,
      vigilado_superintendencia: formData.vigilado_superintendencia,
      tributa_exterior: formData.tributa_exterior
    };

    this.http.post<any>(
      'http://localhost:3000/api/infofinanciera',
      infoFinanciera
    ).pipe(

      switchMap(() => {
        return this.http.post<any>(
          'http://localhost:3000/api/infotributaria',
          infoTributaria
        );
      }),

      switchMap((infoTrib: any) => {
        const idInfoTributaria = infoTrib?.id ?? infoTrib?.id_info_tributaria ?? infoTrib?.idInfoTributaria;

        if (formData.tributa_exterior === 'Sí' || formData.tributa_exterior === 'Si') {
          const paises: Array<{ pais: string; tin: string }> = (formData.paises_exterior ?? [])
            .map((x: any) => ({ pais: x.pais, tin: x.tin }))
            .filter((x: any) => x.pais && x.tin);

          return this.http.post<any>(
            'http://localhost:3000/api/paistributar/bulk',
            { id_info_tributaria: idInfoTributaria, paises }
          );
        }
        return [null];
      })

    ).subscribe({



      next: () => {
        alert('Datos guardados correctamente');
        this.nextTab.emit();
      },

      error: (err) => {
        console.error(err);
        alert('Error al guardar');
      }
    });
  }

  // Botón de volver al formulario anterior
  volver() {
    this.prevTab.emit();
  }

  // Obtener lista de errores del formulario
  obtenerErroresFormulario(): string[] {
    const errores: string[] = [];
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.invalid && control.touched) {
        const nombreCampo = this.obtenerNombreCampo(key);
        if (control.errors?.['required']) {
          errores.push(`- ${nombreCampo} es obligatorio`);
        }
        if (control.errors?.['minlength']) {
          errores.push(`- ${nombreCampo} es muy corto`);
        }
        if (control.errors?.['pattern']) {
          errores.push(`- ${nombreCampo} tiene un formato inválido`);
        }
      }
    });
    return errores;
  }

  // Obtener nombre legible del campo
  obtenerNombreCampo(key: string): string {
    const nombres: { [key: string]: string } = {
      ingresos_op: 'Ingresos operacionales mensuales',
      ingresos_no_op: 'Ingresos operacionales mensuales',
      detalle_ingresos: 'Detalle de ingresos no operacionales u originados en actividades diferentes a la papel',
      ventas_anuales: 'Ventas anuales',
      fecha_cierre_ventas: 'Fecha de cierre de entas',
      egresos_mensuales: 'Egresos mensuales',
      utilidad_neta: 'Utilidad neta',
      total_activos: 'Rotal activos',
      total_pasivos: 'Total pasivos',
      total_patrimonio: 'Total patrimonio'
    };
    return nombres[key] || key;
  }

  // Permite cualquier caracter excluyendo numericos
  soloLetras(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]$/;
    const inputChar = event.key;
    if (inputChar === 'Backspace' || inputChar === 'Delete' ||
      inputChar === 'Tab' || inputChar === 'ArrowLeft' || inputChar === 'ArrowRight') {
      return;
    }
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  // Permite solamente caracteres númericos
  soloNumeros(event: KeyboardEvent) {
    const pattern = /^[0-9]$/;
    const inputChar = event.key;
    if (inputChar === 'Backspace' || inputChar === 'Delete' ||
      inputChar === 'Tab' || inputChar === 'ArrowLeft' || inputChar === 'ArrowRight') {
      return;
    }
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  // Bloquea números negativos y signos
  bloquearNegativos(event: KeyboardEvent) {
    if (['-', '+', 'e', 'E'].includes(event.key)) {
      event.preventDefault();
    }
  }

  // Muestra un formato de moneda colombiana visualmente
  formatearMoneda(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;

    // Solo números
    let valor = input.value.replace(/\D/g, '');

    if (!valor) {
      input.value = '';
      this.form.get(campo)?.setValue(null);
      return;
    }

    const numero = Number(valor);

    // Guardar el número real en el formulario
    this.form.get(campo)?.setValue(numero, {
      emitEvent: false
    });

    // Mostrar formato COP
    input.value = '' + numero.toLocaleString('es-CO');
  }

}