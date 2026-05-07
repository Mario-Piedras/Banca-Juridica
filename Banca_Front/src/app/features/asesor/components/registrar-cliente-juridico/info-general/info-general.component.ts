import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-info-general',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './info-general.component.html',
  styleUrls: ['../registrar-cliente-juridico.component.css']
})
export class InformacionGeneralComponent implements OnInit {
  @Input() datosIniciales: any;
  @Output() formChange = new EventEmitter();
  @Output() nextTab = new EventEmitter();

  form: FormGroup;
  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      nit: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/)
      ]],
      razon_social: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      nombre_corto: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      fecha_constitución: ['', [
        Validators.required,
        this.validarFechaNoFutura()
      ]],
      pais_constitucion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      ciudad_constitución: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      dir_sede_principal: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      pais: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      telefono: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/)
      ]],
      ext: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(5),
        Validators.pattern(/^[0-9]+$/)
      ]],
      barrio: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      ciudad_municipio: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      departamento: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      correo: ['', [
        Validators.required,
        Validators.email
      ]]
    });
  }

  ngOnInit() {
    if (this.datosIniciales) {
      this.form.patchValue(this.datosIniciales);
    }

    this.form.valueChanges.subscribe(valores => {
      this.formChange.emit(valores);
    });

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

  guardarSeccion() {
    console.log(this.form.value);
    if (this.form.valid) {
      this.http.post('http://localhost:3000/api/infoempresas', this.form.value)
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

  // NUEVO: Obtener lista de errores del formulario
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

  // NUEVO: Obtener nombre legible del campo
  obtenerNombreCampo(key: string): string {
    const nombres: { [key: string]: string } = {
      'nit': 'Número de NIT',
      'razon_social': 'Nombre o razón social',
      'nombre_corto': 'Nombre corto o sigla',
      'fecha_constitución': 'Fecha de constitución',
      'pais_constitucion': 'País de constitución',
      'ciudad_constitución': 'Ciudad de constitución',
      'direccionEmpresa': 'Dirección sede principal',
      'pais': 'País',
      'telefono': 'Teléfono',
      'ext': 'Extensión',
      'barrio': 'Barrio',
      'ciudadEmpresa': 'Ciudad/Municipio',
      'departamentoEmpresa': 'Departamento',
      'correo': 'Correo electrónico sede principal'
    };
    return nombres[key] || key;
  }

  soloLetras(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]$/;
    const inputChar = event.key;
    // MEJORA: Permitir teclas de control
    if (inputChar === 'Backspace' || inputChar === 'Delete' ||
      inputChar === 'Tab' || inputChar === 'ArrowLeft' || inputChar === 'ArrowRight') {
      return;
    }
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  soloNumeros(event: KeyboardEvent) {
    const pattern = /^[0-9]$/;
    const inputChar = event.key;
    // MEJORA: Permitir teclas de control
    if (inputChar === 'Backspace' || inputChar === 'Delete' ||
      inputChar === 'Tab' || inputChar === 'ArrowLeft' || inputChar === 'ArrowRight') {
      return;
    }
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}