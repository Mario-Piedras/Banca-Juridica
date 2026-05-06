import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-naturaleza-tipo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './naturaleza-tipo.component.html',
  styleUrls: ['../registrar-cliente-juridico.component.css']
})
export class NaturalezaEntidadComponent implements OnInit {
  @Input() datosIniciales: any;
  @Output() formChange = new EventEmitter();
  @Output() prevTab = new EventEmitter<void>();
  @Output() nextTab = new EventEmitter();

  form: FormGroup;
  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      codigoCIIU: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(20),
        Validators.pattern(/^[0-9]+$/)
      ]],
      detalleActividad: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      numeroEmpleados: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(20),
        Validators.pattern(/^[0-9]+$/)
      ]],
      tipoSociedad: ['', Validators.required],
      tipoEntidad: ['', Validators.required],
      correoLaboral: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
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

  guardarSeccion() {
    console.log(this.form.value);
    if (this.form.valid) {
      this.http.post('http://localhost:3000/api/personasaso', this.form.value)
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
      'codigoCIIU': 'Número de documento',
      'detalleActividad': 'Primer nombre',
      'numeroEmpleados': 'Segundo nombre',
      'tipoSociedad': 'Primer apellido',
      'tipoEntidad': 'Segundo apellido'
    };
    return nombres[key] || key;
  }

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
}