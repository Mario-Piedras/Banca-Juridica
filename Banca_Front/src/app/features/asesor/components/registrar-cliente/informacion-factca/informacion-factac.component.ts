import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-facta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './informacion-factca.component.html',
})
export class FactaComponent implements OnInit, OnChanges {
  form: FormGroup;
  @Input() datosIniciales: any;
  @Output() formChange = new EventEmitter();
  @Output() nextTab = new EventEmitter();
  @Output() mostrarModal = new EventEmitter<{
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    confirmText?: string;
  }>();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      esResidenteExtranjero: [null, Validators.required],
      pais: [''],
    });

    // Validación condicional: si es residente extranjero, el país es obligatorio
    this.form.get('esResidenteExtranjero')?.valueChanges.subscribe(value => {
      const paisControl = this.form.get('pais');
      if (value === true) {
        paisControl?.setValidators([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        ]);
      } else {
        paisControl?.clearValidators();
        paisControl?.setValue(''); // Limpiar el campo cuando no es residente extranjero
      }
      paisControl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    if (this.datosIniciales) {
      console.log('📥 Cargando datos iniciales en FACTA/CRS:', this.datosIniciales);
      this.form.patchValue(this.datosIniciales);
    }

    // 🔄 AUTO-GUARDADO: Emitir datos al padre cada vez que cambie el formulario
    this.form.valueChanges.subscribe(valores => {
      this.formChange.emit(valores);
      console.log('💾 Auto-guardando FACTA/CRS...');
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['datosIniciales'] &&
      changes['datosIniciales'].currentValue
    ) {

      const datos = changes['datosIniciales'].currentValue;

      console.log('📥 FACTA/CRS recibido:', datos);

      this.form.patchValue(
        datos,
        { emitEvent: true }
      );

      // Aplicar validaciones correctamente al cargar
      const paisControl = this.form.get('pais');

      if (datos.esResidenteExtranjero === true) {

        paisControl?.setValidators([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        ]);

      } else {

        paisControl?.clearValidators();

      }

      paisControl?.updateValueAndValidity({
        emitEvent: false
      });
    }
  }

  guardarSeccion() {
    if (this.form.valid) {
      this.formChange.emit(this.form.value);
      this.nextTab.emit();
      this.mostrarModal.emit({
        type: 'success',
        title: 'Información guardada',
        message: 'Sección FACTA/CRS guardada correctamente.',
        confirmText: 'Aceptar'
      });
    } else {
      this.form.markAllAsTouched();
      const errores = this.obtenerErroresFormulario();
      if (errores.length > 0) {
        this.mostrarModal.emit({
          type: 'error',
          title: 'Formulario inválido',
          message: 'Por favor corrige los siguientes errores:\n\n' + errores.join('<br>')
        });
      } else {
        this.mostrarModal.emit({
          type: 'error',
          title: 'Formulario inválido',
          message: 'Por favor completa todos los campos obligatorios.'
        });
      }
    }
  }

  obtenerErroresFormulario(): string[] {
    const errores: string[] = [];

    if (this.form.get('esResidenteExtranjero')?.invalid && this.form.get('esResidenteExtranjero')?.touched) {
      errores.push('- Debe indicar si es residente extranjero');
    }

    const paisControl = this.form.get('pais');
    if (paisControl && paisControl.invalid && paisControl.touched) {
      if (paisControl.errors?.['required']) {
        errores.push('- País es obligatorio para residentes extranjeros');
      }
      if (paisControl.errors?.['minlength']) {
        errores.push('- País debe tener al menos 3 caracteres');
      }
      if (paisControl.errors?.['pattern']) {
        errores.push('- País solo acepta letras y espacios');
      }
    }

    return errores;
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