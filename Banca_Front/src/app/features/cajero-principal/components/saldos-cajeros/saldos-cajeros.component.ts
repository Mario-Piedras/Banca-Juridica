import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaldosCajerosService, CajeroDetalle } from '../../services/saldos.service';

@Component({
  selector: 'app-saldos-cajeros',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saldos-cajeros.component.html',
  styleUrl: './saldos-cajeros.component.css'
})
export class SaldosCajerosComponent implements OnInit {
  cargando: boolean = true;
  cajeros: CajeroDetalle[] = [];
  fechaActualizacion: Date = new Date();
  totalSaldoVentanillas: number = 0;
  cajerosActivos: number = 0;

  constructor(private saldosService: SaldosCajerosService) {}

  ngOnInit(): void {
    this.cargarSaldos();
  }

  cargarSaldos(): void {
    this.cargando = true;

    this.saldosService.obtenerSaldosCajeros().subscribe({
      next: (response) => {
        if (response.success) {
          // Asegurar que los valores numéricos sean realmente números
          this.cajeros = (response.cajeros || []).map((c: CajeroDetalle) => ({
            ...c,
            // Normalizar nombre del cajero por si el backend usa snake_case u otra clave
            nombreCajero: (c as any).nombreCajero || (c as any).nombre_cajero || (c as any).cajero || '',
            saldoEfectivo: Number((c as any).saldoEfectivo) || 0,
            transaccionesHoy: Number((c as any).transaccionesHoy) || 0,
            dineroDepositado: Number((c as any).dineroDepositado) || 0,
            dineroRetirado: Number((c as any).dineroRetirado) || 0,
            cuentasAperturadas: Number((c as any).cuentasAperturadas) || 0
          }));
          this.calcularTotales();
          this.fechaActualizacion = new Date();
        } else {
          console.error('Error:', response.message);
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando saldos:', error);
        this.cargando = false;
      }
    });
  }

  private calcularTotales(): void {
    this.totalSaldoVentanillas = this.cajeros.reduce((sum, c) => sum + c.saldoEfectivo, 0);
    this.cajerosActivos = this.cajeros.filter(c => c.estado === 'Activo').length;
  }
}