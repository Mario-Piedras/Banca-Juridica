import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-naturaleza-tipo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './naturaleza-tipo.component.html',
  styleUrls: [
    '../registrar-cliente-juridico.component.css',
    './naturaleza-tipo.component.css'
  ]
})
export class NaturalezaEntidadComponent implements OnInit {
  @Input() datosIniciales: any;
  @Output() formChange = new EventEmitter();
  @Output() prevTab = new EventEmitter<void>();
  @Output() nextTab = new EventEmitter();
  @Output() saved = new EventEmitter<'parcial'>();

  form: FormGroup;
  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      naturaleza: ['', Validators.required],
      codigo_ciiu: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/)
      ]],
      actividad_economia: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      num_empleados: ['', [
        Validators.required,
        Validators.min(1)
      ]],
      tipo_sociedad: ['', Validators.required],
      otra_sociedad: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      tipo_asociacion: ['', Validators.required],
      otra_asociacion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      ent_estatal: ['', Validators.required],
      otra_ent_estatal: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      ent_estatal_descentralizada: ['', Validators.required],
    });
  }

  ngOnInit() {
    // Precargar datos si existen
    if (this.datosIniciales) {
      this.form.patchValue(this.datosIniciales);
    }

    // Emitir cambios del formulario
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

    // Opcion de otro tipo de sociedad
    this.form.get('tipo_sociedad')?.valueChanges.subscribe(valor => {
      const control = this.form.get('otra_sociedad');

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

    // Opcion de otro tipo de entidad/asociación
    this.form.get('tipo_asociacion')?.valueChanges.subscribe(valor => {
      const control = this.form.get('otra_asociacion');

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

    // Opcion de otra entidad estatal
    this.form.get('ent_estatal')?.valueChanges.subscribe(valor => {
      const otraControl = this.form.get('otra_ent_estatal');

      if (valor === 'Otra') {
        otraControl?.setValidators([
          Validators.required,
          Validators.minLength(3)
        ]);
      } else {
        otraControl?.clearValidators();
        otraControl?.setValue('');
      }

      otraControl?.updateValueAndValidity();
    });

  }

  // Botón de guardar formulario
  guardarSeccion() {
    console.log(this.form.value);
    if (this.form.valid) {

      // Obtener id de empresa guardado previamente
      const id_empresa = localStorage.getItem('id_empresa');
      const datosEnviar = {
        id_empresa,
        ...this.form.value
      };

      console.log(datosEnviar);

      this.http.post('http://localhost:3000/api/tipoentidad', datosEnviar)
        .subscribe({
          next: (res) => {
            console.log('Guardado en BD:', res);
            this.formChange.emit(this.form.value);
            this.saved.emit('parcial');
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
      naturaleza: 'Naturaleza de la entidad',
      codigo_ciiu: 'Código CIIU',
      actividad_economia: 'Detalle de actividad económica',
      num_empleados: 'Número de empleados',
      tipo_sociedad: 'Tipo de sociedad',
      tipo_asociacion: 'Tipo de entidad o asociación',
      ent_estatal: 'Entidad estatal',
      ent_estatal_descentralizada: 'Entidad descentralizada'
    };
    return nombres[key] || key;
  }

  // Permite cualquier caracter excluyendo numéricos
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

  // Permite solamente caracteres numéricos
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

}