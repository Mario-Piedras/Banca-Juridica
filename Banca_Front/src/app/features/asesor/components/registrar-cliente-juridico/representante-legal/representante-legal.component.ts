import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-representante-legal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './representante-legal.component.html',
  styleUrls: ['../registrar-cliente-juridico.component.css']
})
export class RepresentanteLegalComponent implements OnInit {
  @Input() datosIniciales: any;
  @Output() formChange = new EventEmitter();
  @Output() nextTab = new EventEmitter();
  @Output() prevTab = new EventEmitter<void>();

  form: FormGroup;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      numeroDoc: ['', [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/)
      ]],
      primerNombre: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      segundoNombre: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      primerApellido: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      segundoApellido: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      cargo: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(10),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      direccionLaboral: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      barrio: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      ciudadMunicipio: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      departamento: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      pais: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      telefono: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(20),
        Validators.pattern(/^[0-9]+$/)
      ]],
      extension: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(5),
        Validators.pattern(/^[0-9]+$/)
      ]],
      celular: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(20),
        Validators.pattern(/^[0-9]+$/)
      ]],
      correoLaboral: ['', [
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
  }

  guardarSeccion() {
    if (this.form.valid) {
      this.formChange.emit(this.form.value);
      this.nextTab.emit();
      alert('Sección de Información General guardada correctamente');
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
      'numeroDoc': 'Número de documento',
      'primerNombre': 'Primer nombre',
      'segundoNombre': 'Segundo nombre',
      'primerApellido': 'Primer apellido',
      'segundoApellido': 'Segundo apellido',
      'cargo': 'Cargo',
      'direccionLaboral': 'Dirección laboral',
      'barrio': 'Barrio',
      'ciudadMunicipio': 'Ciudad/Municipio',
      'departamento': 'Departamento',
      'pais': 'País',
      'telefonoLaboral': 'Teléfono laboral',
      'extension': 'Extensión',
      'celular': 'Celular',
      'correoLaboral': 'Correo electrónico laboral'
    };
    return nombres[key] || key;
  }

  soloLetras(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;
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
