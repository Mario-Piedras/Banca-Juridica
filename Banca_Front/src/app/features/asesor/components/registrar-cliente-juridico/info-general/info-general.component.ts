import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-info-general',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './info-general.component.html',
})
export class InfoGeneralComponent implements OnInit {
  @Input() datosIniciales: any;
  @Output() formChange = new EventEmitter();
  @Output() nextTab = new EventEmitter();

  form: FormGroup;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      numeroNIT: ['', [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/)
      ]],
      nombreRazon: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      nombreSigla: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(10),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      fechaConstitucion: ['', [
        Validators.required,
        this.validarFechaNoFutura()
      ]],
      paisConstitucion: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      ciudadConstitucion: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      direccionEmpresa: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      paisEmpresa: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      telefonoEmpresa: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(20),
        Validators.pattern(/^[0-9]+$/)
      ]],
      extensionEmpresa: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(5),
        Validators.pattern(/^[0-9]+$/)
      ]],
      barrioEmpresa: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      ciudadEmpresa: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      departamentoEmpresa: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      correoSede: ['', [
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
  if (this.form.valid) {
    // TRANSFORMAR GÉNERO ANTES DE EMITIR
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
      'numeroNIT': 'Número de NIT',
      'nombreRazon': 'Nombre o razón social',
      'nombreSigla': 'Nombre corto o sigla',
      'fechaConstitucion': 'Fecha de constitución',
      'paisConstitucion': 'País de constitución',
      'ciudadConstitucion': 'Ciudad de constitución',
      'direccionEmpresa': 'Dirección sede principal',
      'paisEmpresa': 'País',
      'telefonoEmpresa': 'Teléfono',
      'extensionEmpresa': 'Extensión',
      'barrioEmpresa': 'Barrio',
      'ciudadEmpresa': 'Ciudad/Municipio',
      'departamentoEmpresa': 'Departamento',
      'correoSede': 'Correo electrónico sede principal'
    };
    return nombres[key] || key;
  }

  soloLetras(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;
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