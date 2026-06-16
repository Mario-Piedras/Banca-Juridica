import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-representante-legal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './representante-legal.component.html',
  styleUrls: [
    '../registrar-cliente-juridico.component.css',
    './representante-legal.component.css'
  ]
})
export class RepresentanteLegalComponent implements OnInit, OnChanges {
  @Input() datosIniciales: any;
  @Output() formChange = new EventEmitter();
  @Output() prevTab = new EventEmitter<void>();
  @Output() nextTab = new EventEmitter();
  @Output() saved = new EventEmitter<'parcial'>();


  form: FormGroup;
  constructor(private fb: FormBuilder, private http: HttpClient) {

    this.form = this.fb.group({
      representantes: this.fb.array([]),
      contacto_adicional: ['No', Validators.required]
    });

  }

  // Getter para usar en HTML
  get representantes(): FormArray {
    return this.form.get('representantes') as FormArray;
  }

  // Crear formulario individual
  crearRepresentante(): FormGroup {
    return this.fb.group({
      tipo_documento: ['', Validators.required],
      num_documento: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.pattern(/^[0-9]+$/)
      ]],
      primer_nombre: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      segundo_nombre: ['', [
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      primer_apellido: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      segundo_apellido: ['', [
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]*$/)
      ]],
      cargo: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      dir_laboral: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50)
      ]],
      barrio: ['', [
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.required
      ]],
      ciudad_municipio: ['', [
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.required
      ]],
      departamento: ['', [
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.required
      ]],
      pais: ['', [
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.required
      ]],
      telefono: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(13),
        Validators.pattern(/^[0-9]+$/)
      ]],
      ext: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/)
      ]],
      celular: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/)
      ]],
      correo: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['datosIniciales'] &&
      changes['datosIniciales'].currentValue
    ) {
      console.log(
        '📥 Datos recibidos para edición:',
        changes['datosIniciales'].currentValue
      );
      this.form.patchValue(
        changes['datosIniciales'].currentValue,
        { emitEvent: true }
      );
    }
  }

  ngOnInit(): void {
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

    // Tipo documentos
    this.representantes.controls.forEach((rep: any) => {

      rep.get('tipo_documento')?.valueChanges.subscribe((tipo: string) => {

        const numDocumento = rep.get('num_documento');

        if (tipo === 'Pasaporte') {

          numDocumento?.setValidators([
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(12),
            Validators.pattern(/^[a-zA-Z0-9]+$/)
          ]);

        } else {

          numDocumento?.setValidators([
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(11),
            Validators.pattern(/^[0-9]+$/)
          ]);

        }

        numDocumento?.updateValueAndValidity();

      });

    });

    // Crear representante principal
    this.representantes.push(
      this.crearRepresentante()
    );

    // Escuchar si desea contacto adicional
    this.form.get('contacto_adicional')?.valueChanges.subscribe(valor => {

      if (
        valor === 'Sí' &&
        this.representantes.length === 1
      ) {
        this.representantes.push(
          this.crearRepresentante()
        );
      }

      if (
        valor === 'No' &&
        this.representantes.length > 1
      ) {
        this.representantes.removeAt(1);
      }

    });

  }

  // Botón de guardar formulario
  guardarSeccion() {
    console.log(this.form.value);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Completa todos los campos obligatorios');
      return;
    }

    const id_empresa = localStorage.getItem('id_empresa');
    const payload = { id_empresa, representantes: this.representantes.value };

    console.log(payload);

    this.http.post('http://localhost:3000/api/personasaso', payload)
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
      'tipo_documento': 'Tipo de documento',
      'num_documento': 'Número de documento',
      'primer_nombre': 'Primer nombre',
      'segundo_nombre': 'Segundo nombre',
      'primer_apellido': 'Primer apellido',
      'segundo_apellido': 'Segundo apellido',
      'cargo': 'Cargo',
      'dir_laboral': 'Dirección laboral',
      'barrio': 'Barrio',
      'ciudad_municipio': 'Ciudad/Municipio',
      'departamento': 'Departamento',
      'pais': 'País',
      'telefono': 'Teléfono laboral',
      'ext': 'Extensión',
      'celular': 'Celular',
      'correo': 'Correo electrónico laboral'
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

  // Valida el tipo de documento
  validarDocumento(event: KeyboardEvent, representante: any) {

    const tipoDocumento =
      representante.get('tipo_documento')?.value;

    const inputChar = event.key;

    // Permitir teclas especiales
    if (
      inputChar === 'Backspace' ||
      inputChar === 'Delete' ||
      inputChar === 'Tab' ||
      inputChar === 'ArrowLeft' ||
      inputChar === 'ArrowRight'
    ) {
      return;
    }

    // PASAPORTE → alfanumérico
    if (tipoDocumento === 'Pasaporte') {

      const pattern = /^[a-zA-Z0-9]$/;

      if (!pattern.test(inputChar)) {
        event.preventDefault();
      }

      return;
    }

    // RESTO → solo números
    const pattern = /^[0-9]$/;

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

}