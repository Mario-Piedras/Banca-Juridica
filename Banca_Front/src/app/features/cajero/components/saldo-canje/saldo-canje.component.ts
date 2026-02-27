import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaldoCajeroService } from '../../services/saldo-cajero.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-saldo-canje',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saldo-canje.component.html',
  styleUrls: ['./saldo-canje.component.css']
})
export class SaldoCanjeComponent implements OnInit {
  saldoCheques: number = 0;
  fechaActualizacion: Date | null = null;
  cargando: boolean = true;
  idUsuario: number = 0; // NUEVA VARIABLE

  constructor(
    private saldoCajeroService: SaldoCajeroService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // ✅ Obtener el nombre del usuario actual desde AuthService
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.idUsuario = user.id_usuario; // USAR id_usuario EN LUGAR DE nombre
        console.log('🔑 ID Usuario actual (Efectivo):', this.idUsuario);
        this.cargarSaldo();
      }
    });
  }

  cargarSaldo() {
    if (!this.idUsuario) {
      console.warn('⚠️ No hay cajero definido');
      return;
    }

    this.cargando = true;
    console.log('📦 Consultando saldo en cheques para:', this.idUsuario);

    this.saldoCajeroService.obtenerSaldos(this.idUsuario).subscribe({
      next: (response) => {
        console.log('✅ Respuesta saldo cheques:', response);
        if (response.exito && response.saldos) {
          this.saldoCheques = response.saldos.saldoCheques;
          this.fechaActualizacion = new Date();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar saldo:', error);
        alert('Error al cargar el saldo de cheques');
        this.cargando = false;
      }
    });
  }

  refrescar() {
    this.cargarSaldo();
  }
}
