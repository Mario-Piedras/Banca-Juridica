import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BovedaService, SaldoBovedaResponse } from '../../services/boveda.service'; // Servicio individual

@Component({
  selector: 'app-saldo-boveda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saldo-boveda.component.html',
  styleUrl: './saldo-boveda.component.css'
})
export class SaldoBovedaComponent implements OnInit {
  cargando: boolean = true;
  saldoBoveda: number = 0;
  fechaActualizacion: Date = new Date();

  constructor(private bovedaService: BovedaService) {} // Servicio individual de bóveda

  ngOnInit(): void {
    this.cargarSaldo();
  }

  cargarSaldo(): void {
  this.cargando = true;
  console.log('🔍 Iniciando carga de saldo de bóveda...');

  this.bovedaService.obtenerSaldoBoveda().subscribe({
    next: (response: any) => {
      console.log('✅ Respuesta recibida del API:', response);
      console.log('📊 Tipo de respuesta:', typeof response);
      console.log('🔑 Propiedades disponibles:', Object.keys(response));
      console.log('💰 response.saldo:', response.saldo);
      console.log('🎯 response.success:', response.success);
      
      // Debug detallado de la respuesta
      if (response && typeof response === 'object') {
        console.log('📋 Contenido completo de la respuesta:');
        for (const key in response) {
          console.log(`   ${key}:`, response[key], `(tipo: ${typeof response[key]})`);
        }
      }
      
      if (response.success) {
        // Intentar diferentes nombres de propiedad
        const saldo = response.saldo || response.saldoBoveda || response.data?.saldo || 0;
        console.log('💵 Saldo encontrado:', saldo);
        
        this.saldoBoveda = saldo;
        this.fechaActualizacion = new Date();
        
        console.log('🎉 Saldo asignado al componente:', this.saldoBoveda);
      } else {
        console.error('❌ Error en la respuesta:', response.message);
        this.saldoBoveda = 0;
      }
      this.cargando = false;
    },
    error: (error) => {
      console.error('💥 Error HTTP cargando saldo de bóveda:', error);
      console.error('📞 Detalles del error:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message
      });
      this.saldoBoveda = 0;
      this.cargando = false;
    },
    complete: () => {
      console.log('🏁 Carga de saldo completada');
    }
  });
}
}