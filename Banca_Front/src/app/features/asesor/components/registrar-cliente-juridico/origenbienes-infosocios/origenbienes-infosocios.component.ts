import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-origenbienes-infosocios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './origenbienes-infosocios.component.html',
  styleUrls: [
    '../registrar-cliente-juridico.component.css',
    './origenbienes-infosocios.component.css'
  ]
})
export class DeclaracionBienesInfoSociosComponent implements OnInit {
  @Input() datosIniciales: any;
  @Output() formChange = new EventEmitter();
  @Output() prevTab = new EventEmitter<void>();
  @Output() nextTab = new EventEmitter();
  @Input() idEmpresa!: number;

  form: FormGroup;
  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      // Declaración de origen de bienes y/o fondos
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
      // Información de socios, accionistas y otros relacionados de Persona Jurídica
      rnve: ['', Validators.required],
      hay_socios_accionistas: ['', Validators.required],
      personas_control: ['', Validators.required],
      personas_expuestas: ['', Validators.required],
      bolsa_valores: ['', Validators.required]
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

    // Opcion de otro origen de mis bienes
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

    // Opcion de otra fuente de recursos
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
    if (!this.form.valid) {

      this.form.markAllAsTouched();
      const errores = this.obtenerErroresFormulario();

      if (errores.length > 0) {
        alert('Por favor corrige los siguientes errores:\n\n' + errores.join('\n'));
      } else {
        alert('Por favor completa todos los campos obligatorios.');
      }
      return;
    }

    const formData = this.form.value;

    // Obtener id empresa
    const id_empresa = localStorage.getItem('id_empresa');

    // Datos declaración bienes
    const declaracionBienesInfoSocios = {
      origen_bienes: formData.origen_bienes,
      otro_origen_bienes: formData.otro_origen_bienes,
      fuente_recursos: formData.fuente_recursos,
      otra_fuente_recursos: formData.otra_fuente_recursos,
      pais_origen_bienes: formData.pais_origen_bienes,
      ciudad_origen_bienes: formData.ciudad_origen_bienes,
      recursos_inembargables: formData.recursos_inembargables,
      op_moneda_extj: formData.op_moneda_extj
    };

    // Datos info socios
    const infoSocios = {
      rnve: formData.rnve,
      hay_socios_accionistas: formData.hay_socios_accionistas,
      personas_control: formData.personas_control,
      personas_expuestas: formData.personas_expuestas,
      bolsa_valores: formData.bolsa_valores
    };

    // Guardar declaración bienes
    this.http.post<any>(
      'http://localhost:3000/api/declaracionbienes',
      declaracionBienesInfoSocios
    ).pipe(

      // Guardar info socios
      switchMap((declaracionResponse) => {

        const id_declaracion =
          declaracionResponse.id ||
          declaracionResponse.insertId ||
          declaracionResponse.id_declaracion;

        return this.http.post<any>(
          'http://localhost:3000/api/infosocios',
          infoSocios
        ).pipe(

          switchMap((sociosResponse) => {

            const id_info_socios =
              sociosResponse.id ||
              sociosResponse.insertId ||
              sociosResponse.id_info_socios;

            // Actualizar empresa
            const payloadActualizar = {
              id_declaracion,
              id_info_socios
            };

            return this.http.put(
              `http://localhost:3000/api/infoempresas/${id_empresa}`,
              payloadActualizar
            );

          })

        );

      })

    ).subscribe({

      next: (res) => {

        console.log('Datos guardados:', res);

        alert('Sección guardada correctamente');

        this.formChange.emit(this.form.value);

        this.nextTab.emit();

      },

      error: (err) => {

        console.error(err);

        alert('Error al guardar en la base de datos');

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
      origen_bienes: 'Origen de bienes',
      otro_origen_bienes: 'Otro origen de bienes',
      fuente_recursos: 'Fuente de recursos',
      otra_fuente_recursos: 'Otra fuente de recursos',
      pais_origen_bienes: 'País de origen',
      ciudad_origen_bienes: 'Ciudad de origen de bienes y/o fondos',
      recursos_inembargables: 'Manejan recursos públicos de naturaleza inembargable',
      op_moneda_extj: '¿Realiza operaciones en moneda extranjera?'
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

}