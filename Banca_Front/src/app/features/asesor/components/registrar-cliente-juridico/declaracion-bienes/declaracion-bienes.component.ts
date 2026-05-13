import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-declaracion-bienes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './declaracion-bienes.component.html',
  styleUrls: [
    '../registrar-cliente-juridico.component.css',
    './declaracion-bienes.component.css'
  ]
})
export class DeclaracionBienesComponent implements OnInit {
  @Input() datosIniciales: any;
  @Output() formChange = new EventEmitter();
  @Output() prevTab = new EventEmitter<void>();
  @Output() nextTab = new EventEmitter();

  form: FormGroup;
  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      origen_bienes: ['', Validators.required],
      otro_origen_bienes: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      fuente_recursos: ['', Validators.required],
      otra_fuente_recursos: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      pais_origen_bienes: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      ciudad_origen_bienes: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      recursos_inembargables: ['', Validators.required],
      op_moneda_extj: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.datosIniciales) {
      this.form.patchValue(this.datosIniciales);
    }

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

    // Origen de mis bienes
    this.form.get('origen_bienes')?.valueChanges.subscribe(valor => {
      const control = this.form.get('otro_origen_bienes');

      if (valor === 'Otro') {
        control?.setValidators([
          Validators.required,
          Validators.minLength(3)
        ]);
      } else {
        control?.clearValidators();
        control?.setValue('');
      }

      control?.updateValueAndValidity();
    });

    // Fuente de recursos
    this.form.get('fuente_recursos')?.valueChanges.subscribe(valor => {
      const control = this.form.get('otra_fuente_recursos');

      if (valor === 'Otra') {
        control?.setValidators([
          Validators.required,
          Validators.minLength(3)
        ]);
      } else {
        control?.clearValidators();
        control?.setValue('');
      }

      control?.updateValueAndValidity();
    });

  }

  // Botón de guardar formulario
  guardarSeccion() {
    console.log(this.form.value);
    if (this.form.valid) {
      this.http.post('http://localhost:3000/api/declaracionbienes', this.form.value)
        .subscribe({
          next: (res) => {
            console.log('Guardado en BD:', res);
            alert('Sección guardada correctamente');

            this.formChange.emit(this.form.value);
            this.nextTab.emit();
          },
          error: (err) => {
            console.error(err);
            alert('Error al guardar en la base de datos');
          }
        });

    } else {
      this.form.markAllAsTouched();
      const errores = this.obtenerErroresFormulario();

      if (errores.length > 0) {
        alert('Por favor corrige los siguientes errores:\n\n' + errores.join('\n'));
      } else {
        alert('Por favor completa todos los campos obligatorios.');
      }
    }
  }

  // Botón de volver al formulario anterior
  volver() {
    this.prevTab.emit();
  }

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

  obtenerNombreCampo(key: string): string {
    const nombres: { [key: string]: string } = {
      naturaleza: 'Naturaleza de la entidad',
      codigo_ciiu: 'Código CIIU',
      actividad_economia: 'Detalle de actividad económica',
      num_empleados: 'Número de empleados',
      tipo_sociedad: 'Tipo de sociedad',
      tipo_asociacion: 'Tipo de entidad o asociación',
      ent_estatal: 'Entidad estatal',
      op_moneda_extj: '¿Realiza operaciones en moneda extranjera?'
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

}