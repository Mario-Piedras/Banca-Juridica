import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-informacion-personal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './informacion-personal.component.html',
})
export class InformacionPersonalComponent implements OnInit {
  @Input() datosIniciales: any;
  @Output() formChange = new EventEmitter();
  @Output() nextTab = new EventEmitter();

  form: FormGroup;
  fechaHoy: string;

  constructor(private fb: FormBuilder) {
    const today = new Date();
    this.fechaHoy = today.toISOString().split('T')[0];

    this.form = this.fb.group({
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(11),
        Validators.pattern(/^[0-9]+$/)
      ]],
      lugarExpedicion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      ciudadNacimiento: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      fechaNacimiento: ['', [
        Validators.required,
        this.validarEdadMinima(18) // NUEVO: Validar edad mínima
      ]],
      fechaExpedicion: ['', [
        Validators.required,
        this.validarFechaNoFutura(),
        this.validarFechaExpedicionPosteriorANacimiento()
      ]],
      primerNombre: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      segundoNombre: ['', [
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)
      ]],
      primerApellido: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      segundoApellido: ['', [
        Validators.minLength(2), // NUEVO: Agregado minLength
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)
      ]],
      genero: ['', Validators.required],
      nacionalidad: ['', Validators.required],
      otraNacionalidad: [''],
      estadoCivil: ['', Validators.required],
      grupoEtnico: ['', Validators.required],
    });

    // Revalidar fechaExpedicion cuando cambia fechaNacimiento
    this.form.get('fechaNacimiento')?.valueChanges.subscribe(() => {
      this.form.get('fechaExpedicion')?.updateValueAndValidity();
    });

    // NUEVO: Validar otraNacionalidad cuando nacionalidad es "Otra"
    this.form.get('nacionalidad')?.valueChanges.subscribe(valor => {
      const otraNacionalidadControl = this.form.get('otraNacionalidad');
      if (valor === 'Otra') {
        otraNacionalidadControl?.setValidators([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        ]);
      } else {
        otraNacionalidadControl?.clearValidators();
      }
      otraNacionalidadControl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    if (this.datosIniciales) {
      console.log('Cargando datos iniciales en Información Personal:', this.datosIniciales);
      this.form.patchValue(this.datosIniciales);
    }

 // AUTO-GUARDADO: Emitir datos al padre cada vez que cambie el formulario
  this.form.valueChanges.subscribe(valores => {
    const datosTransformados = this.transformarDatos(valores);
    this.formChange.emit(datosTransformados);
    console.log('Auto-guardando datos personales...');
  });
}


  // NUEVO: Validar edad mínima
  validarEdadMinima(edadMinima: number) {
    return (control: any) => {
      if (!control.value) return null;
      const fechaNac = new Date(control.value);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const mes = hoy.getMonth() - fechaNac.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }
      return edad >= edadMinima ? null : { edadMinima: { requerida: edadMinima, actual: edad } };
    };
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

  validarFechaExpedicionPosteriorANacimiento() {
    return (control: any) => {
      if (!control.value) return null;
      const fechaExpedicion = new Date(control.value);
      const fechaNacimiento = this.form?.get('fechaNacimiento')?.value;
      if (!fechaNacimiento) return null;
      const fechaNac = new Date(fechaNacimiento);

      // MEJORA: La expedición debe ser al menos 16 años después del nacimiento
      const fechaMinimaExpedicion = new Date(fechaNac);
      fechaMinimaExpedicion.setFullYear(fechaNac.getFullYear() + 16);

      return fechaExpedicion >= fechaMinimaExpedicion ? null : { expedicionMuyTemprana: true };
    };
  }

guardarSeccion() {
  if (this.form.valid) {
    // TRANSFORMAR GÉNERO ANTES DE EMITIR
    const datosTransformados = this.transformarDatos(this.form.value);
    this.formChange.emit(datosTransformados);
    this.nextTab.emit();
    console.log('Datos personales guardados correctamente');
    alert('Sección de Información Personal guardada correctamente');
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

// Método para transformar datos antes de enviar
private transformarDatos(valores: any): any {
  return {
    ...valores,
    // Convertir "Femenino" → "F" y "Masculino" → "M"
    genero: valores.genero === 'Femenino' ? 'F' : 
            valores.genero === 'Masculino' ? 'M' : valores.genero,
    
    // Convertir "Colombiana" → "Colombiano"
    nacionalidad: valores.nacionalidad === 'Colombiana' ? 'Colombiano' : valores.nacionalidad,
    
    // Convertir "Ninguno" → "Ninguna"
    grupoEtnico: valores.grupoEtnico === 'Ninguno' ? 'Ninguna' : valores.grupoEtnico
  };
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
        if (control.errors?.['edadMinima']) {
          errores.push(`- Debe ser mayor de ${control.errors['edadMinima'].requerida} años`);
        }
        if (control.errors?.['expedicionMuyTemprana']) {
          errores.push(`- La fecha de expedición debe ser al menos 16 años después de la fecha de nacimiento`);
        }
      }
    });
    return errores;
  }

  // NUEVO: Obtener nombre legible del campo
  obtenerNombreCampo(key: string): string {
    const nombres: { [key: string]: string } = {
      'tipoDocumento': 'Tipo de documento',
      'numeroDocumento': 'Número de documento',
      'lugarExpedicion': 'Lugar de expedición',
      'ciudadNacimiento': 'Ciudad de nacimiento',
      'fechaNacimiento': 'Fecha de nacimiento',
      'fechaExpedicion': 'Fecha de expedición',
      'primerNombre': 'Primer nombre',
      'segundoNombre': 'Segundo nombre',
      'primerApellido': 'Primer apellido',
      'segundoApellido': 'Segundo apellido',
      'genero': 'Género',
      'nacionalidad': 'Nacionalidad',
      'otraNacionalidad': 'Otra nacionalidad',
      'estadoCivil': 'Estado civil',
      'grupoEtnico': 'Grupo étnico'
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

  // NUEVO: Manejar Enter para avanzar al siguiente campo
  onEnterKey(event: KeyboardEvent, siguienteCampoId: string) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const siguienteCampo = document.getElementById(siguienteCampoId);
      if (siguienteCampo) {
        siguienteCampo.focus();
      }
    }
  }
}
