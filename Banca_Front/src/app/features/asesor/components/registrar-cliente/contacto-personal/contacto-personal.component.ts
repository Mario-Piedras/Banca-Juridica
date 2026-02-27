import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contacto-personal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './contacto-personal.component.html',
})
export class ContactoPersonalComponent implements OnInit {
  form: FormGroup;
  @Input() datosIniciales: any;
  @Output() formChange = new EventEmitter();
  @Output() nextTab = new EventEmitter();

  // 🗺️ Datos
  tipoPais: string = 'Colombia'; // Nuevo
  departamentos: string[] = [];
  ciudades: string[] = [];
  colombiaData: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      barrio: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      tipoPais: ['Colombia', Validators.required], // Colombiano u Otro
      pais: ['Colombia'], // Nombre del país
      departamento: ['', Validators.required],
      ciudad: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(15), Validators.pattern(/^[0-9]+$/)]],
      correo: ['', [Validators.required, Validators.email]],
      bloqueTorre: ['', [Validators.maxLength(50)]],
      aptoCasa: ['', [Validators.maxLength(50)]],
    });
  }

  ngOnInit() {
    this.cargarDepartamentosColombia();

    // Desactivar ciudad al inicio
    this.form.get('ciudad')?.disable();

    // 🔗 Cascada según tipo de país
    this.form.get('tipoPais')?.valueChanges.subscribe(tipo => {
      console.log('Tipo de país:', tipo);

      if (tipo === 'Colombia') {
        this.form.get('pais')?.setValue('Colombia');
        this.cargarDepartamentosColombia();
      } else {
        // Si es "Otro", limpiar todo
        this.departamentos = [];
        this.ciudades = [];
        this.form.get('pais')?.setValue('');
        this.form.get('departamento')?.setValue('');
        this.form.get('ciudad')?.setValue('');
      }
    });

    this.form.get('departamento')?.valueChanges.subscribe(departamento => {
      if (this.esColombia()) {
        this.actualizarCiudades(departamento);
      }
      this.form.get('ciudad')?.setValue('');

      // Habilitar/deshabilitar ciudad
      if (departamento) {
        this.form.get('ciudad')?.enable();
      } else {
        this.form.get('ciudad')?.disable();
      }
    });

    // Cargar datos iniciales
    if (this.datosIniciales) {
      this.form.patchValue(this.datosIniciales);
      if (this.datosIniciales.pais === 'Colombia') {
        this.form.get('tipoPais')?.setValue('Colombia');
        if (this.datosIniciales.departamento) {
          this.actualizarCiudades(this.datosIniciales.departamento);
        }
      } else {
        this.form.get('tipoPais')?.setValue('Otro');
      }
    }

    // Auto-guardado
    this.form.valueChanges.subscribe(valores => {
      this.formChange.emit(valores);
    });
  }

  cargarDepartamentosColombia() {
    console.log('📡 Cargando archivo...');
    // Cambiar la ruta - SIN el prefijo /assets/
    this.http.get<any[]>('colombia-data.json').subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.colombiaData = data;
        this.departamentos = data.map(d => d.departamento);
        console.log('Departamentos cargados:', this.departamentos);
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }


  actualizarCiudades(departamento: string) {
    const deptoData = this.colombiaData.find(d => d.departamento === departamento);
    this.ciudades = deptoData ? deptoData.ciudades : [];
    console.log('Ciudades disponibles:', this.ciudades);
  }

  esColombia(): boolean {
    return this.form.get('pais')?.value === 'Colombia';
  }

  guardarSeccion() {
    if (this.form.valid) {
      this.formChange.emit(this.form.value);
      this.nextTab.emit();
      alert('✅ Datos de contacto guardados correctamente');
    } else {
      this.form.markAllAsTouched();
      alert('⚠️ Por favor completa todos los campos obligatorios.');
    }
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
    const pattern = /^[a-zA-Z0-9\s]$/;
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
