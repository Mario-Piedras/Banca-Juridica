import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-actividad-economica',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './actividad-economica.component.html',
})
export class ActividadEconomicaComponent implements OnInit {
  form: FormGroup;
  @Output() formChange = new EventEmitter();
  @Input() datosIniciales: any;
  @Output() nextTab = new EventEmitter();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      profesion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      ocupacion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      codigoCiiu: ['', [
        Validators.minLength(4),
        Validators.maxLength(6),
        Validators.pattern(/^[0-9]{4,6}$/)
      ]],
      detalleActividad: ['', [
        Validators.minLength(5),
        Validators.maxLength(500)
      ]],
      numeroEmpleados: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(999999),
        Validators.pattern(/^[0-9]+$/)
      ]],
      factaCrs: [false, Validators.required],
    });
  }

  ngOnInit() {
    if (this.datosIniciales) {
      console.log('📥 Cargando datos iniciales en Actividad Económica:', this.datosIniciales);
      this.form.patchValue(this.datosIniciales);
    }

    // 🔄 AUTO-GUARDADO: Emitir datos al padre cada vez que cambie el formulario
    this.form.valueChanges.subscribe(valores => {
      this.formChange.emit(valores);
      console.log('💾 Auto-guardando actividad económica...');
    });
  }


  guardarSeccion() {
    if (this.form.valid) {
      this.formChange.emit(this.form.value);
      this.nextTab.emit();
      alert('✅ Datos de actividad económica guardados correctamente');
    } else {
      this.form.markAllAsTouched();
      const errores = this.obtenerErroresFormulario();
      if (errores.length > 0) {
        alert('⚠️ Por favor corrige los siguientes errores:\n\n' + errores.join('\n'));
      } else {
        alert('⚠️ Por favor completa los campos obligatorios.');
      }
    }
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
      'profesion': 'Profesión',
      'ocupacion': 'Ocupación',
      'codigoCiiu': 'Código CIIU',
      'detalleActividad': 'Detalle de actividad',
      'numeroEmpleados': 'Número de empleados',
      'factaCrs': 'FACTA/CRS'
    };
    return nombres[key] || key;
  }

  soloLetras(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' ||
      event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      return;
    }
    if (!pattern.test(event.key)) {
      event.preventDefault();
    }
  }

  soloNumeros(event: KeyboardEvent) {
    const pattern = /^[0-9]$/;
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' ||
      event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      return;
    }
    if (!pattern.test(event.key)) {
      event.preventDefault();
    }
  }

  alfanumerico(event: KeyboardEvent) {
    const pattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,;:()\-]$/;
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' ||
      event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      return;
    }
    if (!pattern.test(event.key)) {
      event.preventDefault();
    }
  }

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
