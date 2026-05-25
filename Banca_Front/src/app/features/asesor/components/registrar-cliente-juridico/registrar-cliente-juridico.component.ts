import { Component, OnInit } from '@angular/core'; // ← AÑADIR OnInit
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AsesorService } from '../../services/asesor.service';

import { ConfirmModalComponent, ConfirmModalType } from './shared/confirm-modal/confirm-modal.component';

// Subcomponentes
import { InformacionGeneralComponent } from './info-general/info-general.component';
import { RepresentanteLegalComponent } from './representante-legal/representante-legal.component';
import { NaturalezaEntidadComponent } from './naturaleza-tipo/naturaleza-tipo.component';
import { InformacionFinancieraTributariaComponent } from './info-fintrib/info-fintrib.component';
import { DeclaracionBienesInfoSociosComponent } from './origenbienes-infosocios/origenbienes-infosocios.component';

@Component({
  selector: 'app-registrar-cliente-juridico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmModalComponent,
    InformacionGeneralComponent,
    RepresentanteLegalComponent,
    NaturalezaEntidadComponent,
    InformacionFinancieraTributariaComponent,
    DeclaracionBienesInfoSociosComponent,
  ],
  templateUrl: './registrar-cliente-juridico.component.html',
  styleUrls: ['./registrar-cliente-juridico.component.css']
})
export class RegistrarClienteJuridicoComponent implements OnInit {
  // 🌐 Control de pestañas
  pestanaActiva: string = 'informacion-general';
  modo: 'nuevo' | 'editar' = 'nuevo';
  idCliente: number | null = null;
  cargando: boolean = false;

  // 🧠 Datos temporales de todos los subformularios
  clienteData: any = {
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

  // Orden de las pestañas para moverse automáticamente
  ordenPestanas = [ // ← AÑADIR ESTA VARIABLE
    'informacion-general',
    'representante-legal',
    'naturaleza-tipo',
    'info-fintrib',
    'origenbienes-infosocios',
  ];

  // 🟦 Modal (solo guardar correcto)
  modalVisible = false;
  modalType: ConfirmModalType = 'success';
  modalTitle = '';
  modalMessage = '';
  modalConfirmText = 'Continuar';
  modalCancelText = 'Cancelar';
  modalShowCancel = false;

  // 🕒 Control delay de 5s antes de avanzar (solo éxito)
  private delayTimer: any = null;

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
            infoGeneral: {},
            representanteLegal: cliente.representanteLegal || {},
            naturalezaEntidad: cliente.naturalezaEntidad || {},
            infoFinancieraTributaria: cliente.infoFinancieraTributaria || {},
            declaracionBienesInfoSocios: cliente.declaracionBienesInfoSocios || {}
          };

          // También actualizar clienteData para validaciones
          this.clienteData = { ...this.datosIniciales };
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar cliente:', err);
        alert('No se pudo cargar el cliente para edición');
        this.router.navigate(['/asesor/consultar-cliente']);
        this.cargando = false;
      }
    });
  }

  cancelarEdicion() {
    if (confirm('¿Estás seguro de que quieres cancelar la edición? Los cambios no guardados se perderán.')) {
      this.router.navigate(['/asesor/consultar-cliente']);
    }
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
    // Delay SOLO cuando el subformulario reporta guardado correcto.
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }

    this.modalType = 'success';
    this.modalTitle = 'Guardado exitoso';
    this.modalMessage = 'La información se guardó correctamente.';
    this.modalConfirmText = 'Continuar';
    this.modalCancelText = 'Cancelar';
    this.modalShowCancel = false;
    this.modalVisible = true;

    this.delayTimer = setTimeout(() => {
      this.modalVisible = false;
      this.delayTimer = null;
      this.irASiguientePestanaActual();
    }, 5000);
  }

  onModalConfirm() {
    // Por diseño, no se usa para avanzar (ya se hace por el timer de 5s), pero si el usuario hace click se respeta.
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
    this.modalVisible = false;
    this.irASiguientePestanaActual();
  }

  onModalCancel() {
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
    this.modalVisible = false;
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
    return Object.values(this.clienteData).every((seccion) =>
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
      ...this.clienteData.infoGeneral,
      representanteLegal: this.clienteData.representanteLegal,
      naturalezaEntidad: this.clienteData.naturalezaEntidad,
      infoFinancieraTributaria: this.clienteData.infoFinancieraTributaria,
      declaracionBienesInfoSocios: this.clienteData.declaracionBienesInfoSocios
    };

    if (this.modo === 'nuevo') {
      this.asesorService.registrarCliente(payload).subscribe({
        next: (res) => {
          console.log('✅ Cliente registrado con éxito:', res);
          alert('Cliente registrado correctamente');
          this.router.navigate(['/asesor/consultar-cliente']);
        },
        error: (err) => {
          console.error('❌ Error al registrar cliente:', err);
          alert('Error al registrar el cliente: ' + (err.error?.message || err.message));
        },
      });
    } else if (this.modo === 'editar' && this.idCliente) {
      this.asesorService.actualizarCliente(this.idCliente, payload).subscribe({
        next: (res) => {
          console.log('✅ Cliente actualizado con éxito:', res);
          alert('Cliente actualizado correctamente');
          this.router.navigate(['/asesor/consultar-cliente']);
        },
        error: (err) => {
          console.error('❌ Error al actualizar cliente:', err);
          alert('Error al actualizar el cliente: ' + (err.error?.message || err.message));
        },
      });
    }
  }

  // Obtener datos iniciales para un subcomponente específico
  obtenerDatosIniciales(nombre: string): any {
    return this.datosIniciales[nombre];
  }
}