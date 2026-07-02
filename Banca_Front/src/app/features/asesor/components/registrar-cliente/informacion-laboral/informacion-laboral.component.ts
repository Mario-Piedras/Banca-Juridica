import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-informacion-laboral',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './informacion-laboral.component.html',
  styleUrl: './informacion-laboral.component.css'
})
export class InformacionLaboralComponent implements OnInit, OnChanges {
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

  // 🗺️ Datos
  tipoPaisEmpresa: string = 'Colombia'; // Nuevo
  departamentosEmpresa: string[] = [];
  ciudadesEmpresa: string[] = [];
  colombiaData: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      nombreEmpresa: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      direccionEmpresa: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      tipoPaisEmpresa: ['Colombia', Validators.required], // Colombiano u Otro
      paisEmpresa: ['Colombia'], // Nombre del país
      departamentoEmpresa: ['', Validators.required],
      ciudadEmpresa: ['', Validators.required],
      telefonoEmpresa: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(15), Validators.pattern(/^[0-9]+$/)]],
      ext: ['', [Validators.pattern(/^[0-9]{1,10}$/)]],
      celularEmpresa: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(15), Validators.pattern(/^[0-9]+$/)]],
      correoLaboral: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    // Cargar departamentos de Colombia desde JSON
    this.cargarDepartamentosColombia();

    // Desactivar ciudad al inicio
    this.form.get('ciudadEmpresa')?.disable();

    // 🔗 Cascada según tipo de país
    this.form.get('tipoPaisEmpresa')?.valueChanges.subscribe(tipo => {
      console.log('🌍 Tipo de país empresa:', tipo);

      if (tipo === 'Colombia') {
        this.form.get('paisEmpresa')?.setValue('Colombia');
        this.cargarDepartamentosColombia();
      } else {
        // Si es "Otro", limpiar todo
        this.departamentosEmpresa = [];
        this.ciudadesEmpresa = [];
        this.form.get('paisEmpresa')?.setValue('');
        this.form.get('departamentoEmpresa')?.setValue('');
        this.form.get('ciudadEmpresa')?.setValue('');
      }
    });

    this.form.get('departamentoEmpresa')?.valueChanges.subscribe(departamento => {
      if (this.esColombiaEmpresa()) {
        this.actualizarCiudades(departamento);
      }
      this.form.get('ciudadEmpresa')?.setValue('');

      // Habilitar/deshabilitar ciudad
      if (departamento) {
        this.form.get('ciudadEmpresa')?.enable();
      } else {
        this.form.get('ciudadEmpresa')?.disable();
      }
    });

    // Cargar datos iniciales
    if (this.datosIniciales) {
      console.log('📥 Cargando datos:', this.datosIniciales);
      this.form.patchValue(this.datosIniciales);
      if (this.datosIniciales.paisEmpresa === 'Colombia') {
        this.form.get('tipoPaisEmpresa')?.setValue('Colombia');
        if (this.datosIniciales.departamentoEmpresa) {
          this.actualizarCiudades(this.datosIniciales.departamentoEmpresa);
        }
      } else {
        this.form.get('tipoPaisEmpresa')?.setValue('Otro');
      }
    }

    // Auto-guardado
    this.form.valueChanges.subscribe(valores => {
      this.formChange.emit(valores);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['datosIniciales'] &&
      changes['datosIniciales'].currentValue
    ) {

      const datos = changes['datosIniciales'].currentValue;

      console.log('📥 Información laboral recibida:', datos);

      this.form.patchValue(datos, {
        emitEvent: false
      });

      if (datos.paisEmpresa === 'Colombia') {

        this.form.get('tipoPaisEmpresa')?.setValue('Colombia', {
          emitEvent: false
        });

        if (datos.departamentoEmpresa) {
          this.actualizarCiudades(datos.departamentoEmpresa);
        }

        this.form.get('ciudadEmpresa')?.enable();

      } else {

        this.form.get('tipoPaisEmpresa')?.setValue('Otro', {
          emitEvent: false
        });

      }
    }
  }

  // Cargar desde colombia-data.json
  cargarDepartamentosColombia() {
    console.log('📡 Cargando archivo...');
    // Cambiar la ruta - SIN el prefijo /assets/
    this.http.get<any[]>('colombia-data.json').subscribe({
      next: (data) => {
        console.log('✅ Datos recibidos:', data);
        this.colombiaData = data;
        this.departamentosEmpresa = data.map(d => d.departamento);
        console.log('✅ Departamentos cargados:', this.departamentosEmpresa);
      },
      error: (err) => {
        console.error('❌ Error:', err);
      }
    });
  }

  actualizarCiudades(departamento: string) {
    const deptoData = this.colombiaData.find(d => d.departamento === departamento);
    this.ciudadesEmpresa = deptoData ? deptoData.ciudades : [];
    console.log('🏙️ Ciudades disponibles:', this.ciudadesEmpresa);
  }

  esColombiaEmpresa(): boolean {
    return this.form.get('paisEmpresa')?.value === 'Colombia';
  }

  guardarSeccion() {
    if (this.form.valid) {
      this.formChange.emit(this.form.value);
      this.nextTab.emit();
      this.mostrarModal.emit({
        type: 'success',
        title: 'Información guardada',
        message: 'Datos laborales guardados correctamente.',
        confirmText: 'Aceptar'
      });
    } else {
      this.form.markAllAsTouched();
      this.mostrarModal.emit({
          type: 'error',
          title: 'Formulario inválido',
          message: 'Por favor completa todos los campos obligatorios.'
        });
    }
  }

  soloLetras(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' ||
      event.key === 'ArrowLeft' || event.key === 'ArrowRight') return;
    if (!pattern.test(event.key)) event.preventDefault();
  }

  soloNumeros(event: KeyboardEvent) {
    const pattern = /^[0-9]$/;
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' ||
      event.key === 'ArrowLeft' || event.key === 'ArrowRight') return;
    if (!pattern.test(event.key)) event.preventDefault();
  }

  alfanumerico(event: KeyboardEvent) {
    const pattern = /^[a-zA-Z0-9\s]$/;
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' ||
      event.key === 'ArrowLeft' || event.key === 'ArrowRight') return;
    if (!pattern.test(event.key)) event.preventDefault();
  }

  onEnterKey(event: KeyboardEvent, siguienteCampoId: string) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const siguienteCampo = document.getElementById(siguienteCampoId);
      if (siguienteCampo) siguienteCampo.focus();
    }
  }

}