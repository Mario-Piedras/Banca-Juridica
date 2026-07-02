import { Component, OnInit } from '@angular/core'; // ← AÑADIR OnInit
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
//import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AsesorService } from '../../../asesor/services/asesor.service';

// Subcomponentes
import { InformacionPersonalComponent } from './informacion-personal/informacion-personal.component';
import { ContactoPersonalComponent } from './contacto-personal/contacto-personal.component';
import { InformacionLaboralComponent } from './informacion-laboral/informacion-laboral.component';
import { InformacionFinancieraComponent } from './informacion-financiera/informacion-financiera.component';
import { ActividadEconomicaComponent } from './actividad-economica/actividad-economica.component';
import { FactaComponent } from './informacion-factca/informacion-factac.component';
import { ConfirmModalComponent } from '../../../../shared/components/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-registrar-cliente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    //HttpClientModule,
    InformacionPersonalComponent,
    ContactoPersonalComponent,
    InformacionLaboralComponent,
    InformacionFinancieraComponent,
    ActividadEconomicaComponent,
    FactaComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './registrar-cliente.component.html',
  styleUrls: ['./registrar-cliente.component.css']
})
export class RegistrarClienteComponent implements OnInit { // ← IMPLEMENTAR OnInit
  // 🌐 Control de pestañas
  pestanaActiva: string = 'datos-personales';
  modo: 'nuevo' | 'editar' = 'nuevo';
  idCliente: number | null = null;
  cargando: boolean = false;

  // 🧠 Datos temporales de todos los subformularios
  clienteData: any = {
    datosPersonales: null,
    contacto: null,
    actividad: null,
    laboral: null,
    financiera: null,
    facta: null,
  };

  // 🧭 Datos cargados para cada subcomponente
  datosIniciales: any = {
    datosPersonales: null,
    contacto: null,
    actividad: null,
    laboral: null,
    financiera: null,
    facta: null,
  };

  // Modal de confirmación
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' | 'confirm' = 'success';
  modalConfirmText = 'Aceptar';

  // Orden de las pestañas para moverse automáticamente
  ordenPestanas = [ // ← AÑADIR ESTA VARIABLE
    'datos-personales',
    'contacto-personal',
    'info-laboral',
    'facta',
  ];

  // Mostrar modal de confirmación (para guardar exitosamente)
  abrirModalGuardado(config: {
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    confirmText?: string;
    navigateOnConfirm?: boolean;
  }): void {
    this.modalVisible = true;
    this.modalType = config.type;
    this.modalTitle = config.title;
    this.modalMessage = config.message;
    this.modalConfirmText = config.confirmText ?? 'Aceptar';
    // Bandera interna por si se requiere navegación post-confirm
    (this as any)._navigateOnConfirm = !!config.navigateOnConfirm;
  }

  onModalConfirm(): void {
    const navigate = (this as any)._navigateOnConfirm as boolean | undefined;
    this.modalVisible = false;

    if (navigate) {
      this.router.navigate(['/asesor/consultar-cliente']);
      return;
    }
  }

  onModalCancel(): void {
    this.modalVisible = false;
  }

  onModalClosed(): void {
    this.modalVisible = false;
  }

  constructor(
    private asesorService: AsesorService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    // Verificar si estamos en modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !isNaN(Number(id))) {
      this.modo = 'editar';
      this.idCliente = parseInt(id, 10);
      this.cargarClienteExistente(this.idCliente);
    }
  }

  cargarClienteExistente(idCliente: number) {
    this.cargando = true;
    // Primero necesitas agregar este método al AsesorService
    // Voy a mostrarte cómo modificarlo después
    this.asesorService.obtenerClientePorId(idCliente).subscribe({
      next: (respuesta) => {
        if (respuesta.success && respuesta.data) {
          const cliente = respuesta.data;

          // Organizar datos en la estructura esperada por los subcomponentes
          this.datosIniciales = {
            datosPersonales: {
              tipoDocumento: cliente.tipoDocumento,
              numeroDocumento: cliente.numeroDocumento,
              lugarExpedicion: cliente.lugarExpedicion,
              ciudadNacimiento: cliente.ciudadNacimiento,
              fechaNacimiento: cliente.fechaNacimiento,
              fechaExpedicion: cliente.fechaExpedicion,
              primerNombre: cliente.primerNombre,
              segundoNombre: cliente.segundoNombre,
              primerApellido: cliente.primerApellido,
              segundoApellido: cliente.segundoApellido,
              genero: cliente.genero,
              nacionalidad: cliente.nacionalidad,
              otraNacionalidad: cliente.otraNacionalidad,
              estadoCivil: cliente.estadoCivil,
              grupoEtnico: cliente.grupoEtnico,
            },
            contacto: cliente.contacto || {},
            actividad: cliente.actividad || {},
            laboral: cliente.laboral || {},
            financiera: cliente.financiera || {},
            facta: cliente.facta || {}
          };

          // También actualizar clienteData para validaciones
          this.clienteData = { ...this.datosIniciales };
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar cliente:', err);
        const errorMessage = 'No se pudo cargar el cliente para edición';
        this.abrirModalGuardado({
          type: 'error',
          title: 'Error',
          message: errorMessage,
          confirmText: 'Aceptar',
          navigateOnConfirm: true,
        });
        this.cargando = false;
      }
    });
  }

  cancelarEdicion() {
    this.abrirModalGuardado({
      type: 'confirm',
      title: 'Cancelar edición',
      message: '¿Estás seguro de que quieres cancelar la edición? Los cambios no guardados se perderán.',
      confirmText: 'Aceptar',
      navigateOnConfirm: true,
    });
  }

  // 🔁 Cambiar pestaña manualmente
  cambiarPestana(nombre: string) {
    this.pestanaActiva = nombre;
  }

  // ⏭️ Ir a la siguiente pestaña automáticamente
  irASiguientePestanaActual() {
    const indexActual = this.ordenPestanas.indexOf(this.pestanaActiva);
    if (indexActual < this.ordenPestanas.length - 1) {
      this.pestanaActiva = this.ordenPestanas[indexActual + 1];
    }
  }

  // 📥 Recibir datos desde los subcomponentes
  actualizarDatos(nombre: string, data: any) {
    this.clienteData[nombre] = data;
    console.log(`✅ Datos actualizados (${nombre}):`, data);
  }

  // 📩 Escuchar evento de "nextTab" desde los subcomponentes
  manejarNextTab() {
    this.irASiguientePestanaActual();
  }

  // ✅ Validar que todo esté diligenciado antes de registrar
  datosCompletos(): boolean {
    return Object.values(this.clienteData).every((seccion) =>
      seccion && Object.keys(seccion).length > 0
    );
  }

  // 🚀 Registrar o actualizar cliente
  registrarCliente() {
    if (!this.datosCompletos()) {
      this.abrirModalGuardado({
        type: 'error',
        title: 'Faltan módulos por completar',
        message: '⚠️ Debes completar todos los módulos antes de ' +
          (this.modo === 'nuevo' ? 'registrar' : 'actualizar') + ' el cliente.',
        confirmText: 'Aceptar',
        navigateOnConfirm: false,
      });
      return;
    }

    const payload = {
      ...this.clienteData.datosPersonales,
      contacto: this.clienteData.contacto,
      actividad: this.clienteData.actividad,
      laboral: this.clienteData.laboral,
      financiera: this.clienteData.financiera,
      facta: this.clienteData.facta,
    };

    if (this.modo === 'nuevo') {
      this.asesorService.registrarCliente(payload).subscribe({
        next: (res) => {
          console.log('✅ Cliente registrado con éxito:', res);
          this.abrirModalGuardado({
            type: 'success',
            title: 'Registro finalizado',
            message: 'Cliente registrado correctamente.',
            confirmText: 'Aceptar',
            navigateOnConfirm: true,
          });
        },
        error: (err) => {
          console.error('❌ Error al registrar cliente:', err);
          const errorMessage = err.error?.message || err.message || 'Error al registrar el cliente';
          this.abrirModalGuardado({
            type: 'error',
            title: 'Error',
            message: errorMessage,
            confirmText: 'Aceptar',
            navigateOnConfirm: false,
          });
        },
      });
    } else if (this.modo === 'editar' && this.idCliente) {
      this.asesorService.actualizarCliente(this.idCliente, payload).subscribe({
        next: (res) => {
          console.log('✅ Cliente actualizado con éxito:', res);
          this.abrirModalGuardado({
            type: 'success',
            title: 'Registro finalizado',
            message: 'Cliente actualizado correctamente.',
            confirmText: 'Aceptar',
            navigateOnConfirm: true,
          });
        },
        error: (err) => {
          console.error('❌ Error al actualizar cliente:', err);
          const errorMessage = err.error?.message || err.message || 'Error al actualizar el cliente';
          this.abrirModalGuardado({
            type: 'error',
            title: 'Error',
            message: errorMessage,
            confirmText: 'Aceptar',
            navigateOnConfirm: false,
          });
        },
      });
    }
  }

  // Obtener datos iniciales para un subcomponente específico
  obtenerDatosIniciales(nombre: string): any {
    return this.datosIniciales[nombre];
  }
}