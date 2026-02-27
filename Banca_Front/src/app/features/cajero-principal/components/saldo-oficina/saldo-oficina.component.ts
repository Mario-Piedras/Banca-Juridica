import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OficinaService, SaldoOficinaResponse } from '../../services/oficina.service';

@Component({
  selector: 'app-saldo-oficina',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saldo-oficina.component.html',
  styleUrl: './saldo-oficina.component.css'
})
export class SaldoOficinaComponent implements OnInit {
  cargando: boolean = true;
  saldoOficina: number = 0;
  saldoBoveda: number = 0;
  saldoVentanillas: number = 0;
  fechaActualizacion: Date = new Date();

  constructor(private oficinaService: OficinaService) {}

  ngOnInit(): void {
    this.cargarSaldo();
  }

  cargarSaldo(): void {
    this.cargando = true;

    this.oficinaService.obtenerSaldoOficina().subscribe({
      next: (response: SaldoOficinaResponse) => {
        if (response.success) {
          this.saldoOficina = response.saldoOficina;
          this.saldoBoveda = response.saldoBoveda;
          this.saldoVentanillas = response.saldoVentanillas;
          this.fechaActualizacion = new Date();
        } else {
          console.error('Error:', response.message);
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando saldo de oficina:', error);
        this.cargando = false;
      }
    });
  }
}