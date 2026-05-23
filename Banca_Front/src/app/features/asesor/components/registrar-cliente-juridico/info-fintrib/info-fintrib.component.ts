import { Component, EventEmitter, Output, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { switchMap, forkJoin, of } from 'rxjs';

interface PaisTributar {
  pais: string;
  tin: string;
}

@Component({
  selector: 'app-info-fintrib',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './info-fintrib.component.html',
  styleUrls: [
    '../registrar-cliente-juridico.component.css',
    './info-fintrib.component.css'
  ]
})
export class InformacionFinancieraTributariaComponent implements OnInit {
  @Input() datosIniciales: any;
  @Output() formChange = new EventEmitter();
  @Output() prevTab = new EventEmitter<void>();
  @Output() nextTab = new EventEmitter();

  form: FormGroup;
  listaPaises: PaisTributar[] = [];

  private STORAGE_KEY = 'paises_tributarios';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      // Información financiera
      ingresos_op: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(9999999999999)
      ]],
      ingresos_no_op: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(9999999999999)
      ]],
      detalle_ingresos: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      ventas_anuales: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(9999999999999)
      ]],
      fecha_cierre_ventas: ['', [
        Validators.required,
        this.validarFechaNoFutura()
      ]],
      egresos_mensuales: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(9999999999999)
      ]],
      utilidad_neta: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(9999999999999)
      ]],
      total_activos: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(9999999999999)
      ]],
      total_pasivos: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(9999999999999)
      ]],
      total_patrimonio: ['', [
        Validators.required,
        Validators.max(9999999999999)
      ]],
      // Información tributaria
      tipo_contribuyente: ['', Validators.required],
      clase_contribuyente: ['', Validators.required],
      responsable_iva: ['', Validators.required],
      autorretenedor: ['', Validators.required],
      intermediario_mercado: ['', Validators.required],
      vigilado_superintendencia: ['', Validators.required],
      tributa_exterior: ['', Validators.required],
      // Países tributarios
      pais: ['', [
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)
      ]],
      tin: ['', [
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[0-9]+$/)
      ]]
    });
  }

  ngOnInit(): void {
    // Precargar datos si existen
    if (this.datosIniciales) {
      this.form.patchValue(this.datosIniciales);
    }

    // Calcular patrimonio automáticamente
    this.form.get('total_activos')?.valueChanges.subscribe(() => {
      this.calcularPatrimonio();
    });

    this.form.get('total_pasivos')?.valueChanges.subscribe(() => {
      this.calcularPatrimonio();
    });

    // Cargar localStorage
    const dataStorage = localStorage.getItem(
      this.STORAGE_KEY
    );

    if (dataStorage) {
      this.listaPaises = JSON.parse(
        dataStorage
      );
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

  }

  // Limpia el localStorage al cerrar o recargar la página
  @HostListener('window:beforeunload')
  limpiarStorage(): void {
    localStorage.removeItem(
      this.STORAGE_KEY
    );
  }

  calcularPatrimonio(): void {
    const activos = Number(this.form.get('total_activos')?.value) || 0;
    const pasivos = Number(this.form.get('total_pasivos')?.value) || 0;
    const patrimonio = activos - pasivos;

    // Guardar valor numérico real
    this.form.get('total_patrimonio')?.setValue(
      patrimonio > 0 ? patrimonio : 0,
      { emitEvent: false }
    );

    // Mostrar formato moneda en el input
    const inputPatrimonio =
      document.getElementById('total_patrimonio') as HTMLInputElement;

    if (inputPatrimonio) {
      inputPatrimonio.value =
        patrimonio.toLocaleString('es-CO');
    }
  }

  agregarPais(): void {

    const paisControl = this.form.get('pais');
    const tinControl = this.form.get('tin');

    // Marcar campos como tocados para mostrar errores
    paisControl?.markAsTouched();
    tinControl?.markAsTouched();

    // Validar formulario
    if (
      !paisControl ||
      !tinControl ||
      paisControl.invalid ||
      tinControl.invalid
    ) {

      alert(
        'Debe ingresar un país y TIN válidos'
      );

      return;
    }

    const pais =
      paisControl.value.trim();

    const tin =
      tinControl.value.trim();

    // Evitar duplicados
    const existe =
      this.listaPaises.some(
        item =>
          item.pais.toLowerCase() === pais.toLowerCase()
          &&
          item.tin === tin
      );

    if (existe) {

      alert(
        'El país y TIN ya fueron agregados'
      );

      return;
    }

    const nuevoPais: PaisTributar = {
      pais,
      tin
    };

    this.listaPaises.push(
      nuevoPais
    );

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(
        this.listaPaises
      )
    );

    // Limpiar campos
    this.form.patchValue({
      pais: '',
      tin: ''
    });

    // Resetear estado visual
    paisControl.reset();
    tinControl.reset();

  }

  eliminarPais(
    index: number
  ): void {

    this.listaPaises.splice(
      index,
      1
    );

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(
        this.listaPaises
      )
    );

  }

  // Botón de guardar formulario
  guardarSeccion(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    // Validar mínimo 1 país
    if (
      this.form.value.tributa_exterior === 'Sí'
      &&
      this.listaPaises.length === 0
    ) {

      alert('Debe agregar al menos un país tributario');
      return;
    }

    const formData = this.form.value;

    // Obtener empresa guardada
    const id_empresa =
      localStorage.getItem('id_empresa');

    const infoFinanciera = {
      id_empresa,
      ingresos_op: formData.ingresos_op,
      ingresos_no_op: formData.ingresos_no_op,
      detalle_ingresos: formData.detalle_ingresos,
      ventas_anuales: formData.ventas_anuales,
      fecha_cierre_ventas: formData.fecha_cierre_ventas,
      egresos_mensuales: formData.egresos_mensuales,
      utilidad_neta: formData.utilidad_neta,
      total_activos: formData.total_activos,
      total_pasivos: formData.total_pasivos,
      total_patrimonio: formData.total_patrimonio
    };

    const infoTributaria = {
      id_empresa,
      tipo_contribuyente: formData.tipo_contribuyente,
      clase_contribuyente: formData.clase_contribuyente,
      responsable_iva: formData.responsable_iva,
      autorretenedor: formData.autorretenedor,
      intermediario_mercado: formData.intermediario_mercado,
      vigilado_superintendencia: formData.vigilado_superintendencia,
      tributa_exterior: formData.tributa_exterior
    };

    // Flujo guardado
    this.http.post<any>('http://localhost:3000/api/infofinanciera', infoFinanciera).pipe(
      // Guardar info tributaria
      switchMap(() => {
        return this.http.post<any>('http://localhost:3000/api/infotributaria', infoTributaria);
      }),

      // Guardar países tributarios
      switchMap((tributariaResponse) => {
        console.log('RESPUESTA INFO TRIBUTARIA:', tributariaResponse);

        if (formData.tributa_exterior !== 'Sí') {
          return of(null);
        }

        const idInfoTributaria =
          tributariaResponse.data?.id ||
          tributariaResponse.id_info_tributaria ||
          tributariaResponse.id ||
          tributariaResponse.insertId;

        console.log('ID INFO TRIBUTARIA:', idInfoTributaria);

        const peticiones =
          this.listaPaises.map(item => {

            const payload = {
              pais: item.pais,
              tin: item.tin,
              id_info_tributaria: idInfoTributaria
            };

            return this.http.post(
              'http://localhost:3000/api/paistributar',
              payload
            );

          });

        return forkJoin(peticiones);

      })

    ).subscribe({

      next: () => {

        // Limpiar storage
        localStorage.removeItem(
          this.STORAGE_KEY
        );

        alert('Datos guardados correctamente');
        this.nextTab.emit();

      },

      error: (err) => {
        console.error(err);

        alert('Error al guardar');
      }
    });
  }

  // Botón de volver al formulario anterior
  volver() {
    this.prevTab.emit();
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
      ingresos_op: 'Ingresos operacionales mensuales',
      ingresos_no_op: 'Ingresos operacionales mensuales',
      detalle_ingresos: 'Detalle de ingresos no operacionales u originados en actividades diferentes a la papel',
      ventas_anuales: 'Ventas anuales',
      fecha_cierre_ventas: 'Fecha de cierre de entas',
      egresos_mensuales: 'Egresos mensuales',
      utilidad_neta: 'Utilidad neta',
      total_activos: 'Rotal activos',
      total_pasivos: 'Total pasivos',
      total_patrimonio: 'Total patrimonio'
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

  // Bloquea números negativos y signos
  bloquearNegativos(event: KeyboardEvent) {
    if (['-', '+', 'e', 'E'].includes(event.key)) {
      event.preventDefault();
    }
  }

  // Muestra un formato de moneda colombiana visualmente
  formatearMoneda(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;

    // Eliminar todo lo que no sea número
    let valor = input.value.replace(/\D/g, '');

    // Limitar a 13 dígitos reales
    valor = valor.substring(0, 13);

    if (!valor) {
      input.value = '';
      this.form.get(campo)?.setValue(null);
      return;
    }

    const numero = Number(valor);

    // Guardar valor limpio
    this.form.get(campo)?.setValue(numero, {
      emitEvent: false
    });

    // Mostrar con separadores
    input.value = numero.toLocaleString('es-CO');
  }

}