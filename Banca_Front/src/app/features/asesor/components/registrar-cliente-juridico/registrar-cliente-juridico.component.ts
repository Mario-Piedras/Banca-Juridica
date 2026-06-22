import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AsesorService } from '../../services/asesor.service';

// Subcomponentes
import { InformacionGeneralComponent } from './info-general/info-general.component';
import { RepresentanteLegalComponent } from './representante-legal/representante-legal.component';
import { NaturalezaEntidadComponent } from './naturaleza-tipo/naturaleza-tipo.component';
import { InformacionFinancieraTributariaComponent } from './info-fintrib/info-fintrib.component';
import { DeclaracionBienesInfoSociosComponent } from './origenbienes-infosocios/origenbienes-infosocios.component';
import { ConfirmModalComponent } from '../../../../shared/components/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-registrar-cliente-juridico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InformacionGeneralComponent,
    RepresentanteLegalComponent,
    NaturalezaEntidadComponent,
    InformacionFinancieraTributariaComponent,
    DeclaracionBienesInfoSociosComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './registrar-cliente-juridico.component.html',
  styleUrls: ['./registrar-cliente-juridico.component.css']
})
export class RegistrarClienteJuridicoComponent implements OnInit {
  // 🌐 Control de pestañas
  pestanaActiva: string = 'informacion-general';
  modo: 'nuevo' | 'editar' = 'nuevo';
  idEmpresa: number | null = null;
  cargando: boolean = false;

  // 🧠 Datos temporales de todos los subformularios
  empresaData: any = {
    infoGeneral: null,
    representanteLegal: null,
    naturalezaEntidad: null,
    infoFinancieraTributaria: null,
    declaracionBienesInfoSocios: null,
  };

  // 🧭 Datos cargados para cada subcomponente
  datosIniciales: any = {
    infoGeneral: null,
    representanteLegal: null,
    naturalezaEntidad: null,
    infoFinancieraTributaria: null,
    declaracionBienesInfoSocios: null,
  };

  // Estado modal confirmación
  confirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmType: 'success' | 'error' | 'confirm' = 'success';
  confirmButtonText = 'Aceptar';

  // Orden de las pestañas para moverse automáticamente
  ordenPestanas = [ // ← AÑADIR ESTA VARIABLE
    'informacion-general',
    'representante-legal',
    'naturaleza-tipo',
    'info-fintrib',
    'origenbienes-infosocios',
  ];

  // Mostrar modal de confirmación (para guardar exitosamente)
  abrirModalGuardado(modulo: 'parcial' | 'final' | string): void {
    this.confirmVisible = true;
    this.confirmType = 'success';

    if (modulo === 'final') {
      this.confirmTitle = 'Registro finalizado';
      this.confirmMessage = 'El registro finalizo correctamente.';
      this.confirmButtonText = 'Aceptar';
      return;
    }

    this.confirmTitle = 'Información guardada';
    this.confirmMessage = 'Los campos se guardaron correctamente.';
    this.confirmButtonText = 'Aceptar';
  }

  onModalConfirm(): void {
    // Cerrar modal
    this.confirmVisible = false;

    // Cancelar edición
    if (this.confirmType === 'confirm') {
      this.router.navigate(['/asesor/consultar-cliente']);
      return;
    }

    // “Registro finalizado” => redirigir a consultar-cliente.
    if (
      this.confirmType === 'success' &&
      this.confirmTitle === 'Registro finalizado'
    ) {
      this.router.navigate(['/asesor/consultar-cliente']);
      return;
    }

    // Para guardados parciales: avanzar exactamente a la siguiente pestaña.
    if (
      this.confirmType === 'success' &&
      this.confirmTitle === 'Información guardada'
    ) {
      this.irASiguientePestanaActual();
    }
  }

  onModalCancel(): void {
    this.confirmVisible = false;
  }

  onModalClosed(): void {
    this.confirmVisible = false;
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
      this.idEmpresa = parseInt(id, 10);
      this.cargarEmpresaExistente(this.idEmpresa);
    }
  }

  cargarEmpresaExistente(idEmpresa: number) {
    this.cargando = true;
    // Primero necesitas agregar este método al AsesorService
    // Voy a mostrarte cómo modificarlo después
    this.asesorService.obtenerEmpresaPorId(idEmpresa).subscribe({
      next: (respuesta) => {
        if (respuesta.success && respuesta.data) {
          const empresa = respuesta.data;

          // Organizar datos en la estructura esperada por los subcomponentes
          this.datosIniciales = {
            infoGeneral: empresa.infoGeneral || {},
            representanteLegal: empresa.representanteLegal || {},
            naturalezaEntidad: empresa.naturalezaEntidad || {},
            infoFinancieraTributaria: empresa.infoFinancieraTributaria || {},
            declaracionBienesInfoSocios: empresa.declaracionBienesInfoSocios || {}
          };

          // También actualizar empresaData para validaciones
          this.empresaData = { ...this.datosIniciales };
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar cliente:', err);
        this.confirmVisible = true;
        this.confirmTitle = 'Error';
        this.confirmMessage = 'No se pudo cargar el cliente para edición';
        this.confirmButtonText = 'Aceptar';
        this.confirmType = 'error';
        this.router.navigate(['/asesor/consultar-cliente']);
        this.cargando = false;
      }
    });
  }

  cancelarEdicion() {
    this.confirmVisible = true;
    this.confirmTitle = '¿Estás seguro de que quieres cancelar la edición?';
    this.confirmMessage =
      'Los cambios no guardados se perderán.';
    this.confirmType = 'confirm';
    this.confirmButtonText = 'Aceptar';
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
    this.empresaData[nombre] = data;
    console.log(`✅ Datos actualizados (${nombre}):`, data);
  }

  // 📩 Escuchar evento de "nextTab" desde los subcomponentes
  manejarNextTab() {
    this.irASiguientePestanaActual();
  }

  // 📤 Manejar evento de "prevTab" para volver a la pestaña anterior
  manejarPrevTab() {
    this.irAPestanaAnterior();
  }

  // ⏮️ Ir a la pestaña anterior
  irAPestanaAnterior() {
    const indexActual = this.ordenPestanas.indexOf(this.pestanaActiva);
    if (indexActual > 0) {
      this.pestanaActiva = this.ordenPestanas[indexActual - 1];
    }
  }

  // ✅ Validar que todo esté diligenciado antes de registrar
  datosCompletos(): boolean {
    return Object.values(this.empresaData).every((seccion) =>
      seccion && Object.keys(seccion).length > 0
    );
  }

  // 🚀 Registrar o actualizar cliente
  registrarCliente() {
    if (!this.datosCompletos()) {
      alert('⚠️ Debes completar todos los módulos antes de ' +
        (this.modo === 'nuevo' ? 'registrar' : 'actualizar') + ' el cliente.');
      return;
    }

    const payload = {
      infoGeneral: this.empresaData.infoGeneral,
      representanteLegal: this.empresaData.representanteLegal,
      naturalezaEntidad: this.empresaData.naturalezaEntidad,
      infoFinancieraTributaria: this.empresaData.infoFinancieraTributaria,
      declaracionBienesInfoSocios: this.empresaData.declaracionBienesInfoSocios
    };

    if (this.modo === 'nuevo') {
      this.asesorService.registrarCliente(payload).subscribe({
        next: (res) => {
          console.log('✅ Cliente registrado con éxito:', res);
          this.confirmVisible = true;
          this.confirmTitle = 'Registro finalizado';
          this.confirmMessage = 'El registro finalizo correctamente.';
          this.confirmButtonText = 'Aceptar';
          this.confirmType = 'success';
        },
        error: (err) => {
          console.error('❌ Error al registrar cliente:', err);
          const errorMessage = err.error?.message || err.message || 'Error al registrar el cliente';
          this.confirmVisible = true;
          this.confirmTitle = 'Error';
          this.confirmMessage = errorMessage;
          this.confirmButtonText = 'Aceptar';
          this.confirmType = 'error';
        },
      });
    } else if (this.modo === 'editar' && this.idEmpresa) {
      this.asesorService.actualizarEmpresa(this.idEmpresa, payload).subscribe({
        next: (res) => {
          console.log('✅ Empresa actualizada con éxito:', res);
          this.confirmVisible = true;
          this.confirmTitle = 'Registro finalizado';
          this.confirmMessage = 'Empresa actualizada correctamente.';
          this.confirmButtonText = 'Aceptar';
          this.confirmType = 'success';
        },
        error: (err) => {
          console.error('❌ Error al actualizar cliente:', err);
          const errorMessage = err.error?.message || err.message || 'Error al actualizar el cliente';
          this.confirmVisible = true;
          this.confirmTitle = 'Error';
          this.confirmMessage = errorMessage;
          this.confirmButtonText = 'Aceptar';
          this.confirmType = 'error';
        },
      });
    }
  }

  // Obtener datos iniciales para un subcomponente específico
  obtenerDatosIniciales(nombre: string): any {
    return this.datosIniciales[nombre];
  }
}