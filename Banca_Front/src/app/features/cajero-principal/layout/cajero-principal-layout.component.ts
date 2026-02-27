import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-cajero-principal-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-100 overflow-hidden">
      <app-sidebar [menuItems]="cajeroPrincipalMenuItems"></app-sidebar>

      <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <app-header
          [titulo]="'Panel de Cajero Principal'"
          [subtitulo]="'Sistema de Simulación Bancaria - Banca Uno'">
        </app-header>

        <div class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class CajeroPrincipalLayoutComponent {
  cajeroPrincipalMenuItems = [
    {
      titulo: 'Cuenta de Ahorros',
      items: [
        { label: 'Saldo Ventanilla Efectivo', ruta: '/cajero-principal/saldo-efectivo' },
        { label: 'Saldo Canje', ruta: '/cajero-principal/saldo-canje' },
        { label: 'Apertura de cuenta', ruta: '/cajero-principal/apertura-cuenta' },
        { label: 'Consignación', ruta: '/cajero-principal/consignacion' },
        { label: 'Retiro por ventanilla', ruta: '/cajero-principal/retiro-ventanilla' },
        { label: 'Nota débito', ruta: '/cajero-principal/nota-debito' },
        { label: 'Cancelación de cuenta', ruta: '/cajero-principal/cancelacion-cuenta' },
        { label: 'Traslado Cajero', ruta: '/cajero-principal/traslado-cajero' },
        { label: 'Recibo Traslado', ruta: '/cajero-principal/recibo-traslado' }
      ]
    },
    {
      titulo: 'Supervisión - Cajero Principal',
      items: [
        { label: 'Saldos de Cajeros', ruta: '/cajero-principal/saldos-cajeros' },
        { label: 'Saldo de Bóveda', ruta: '/cajero-principal/saldo-boveda' },
        { label: 'Saldo de Oficina', ruta: '/cajero-principal/saldo-oficina' }
      ]
    }
  ];
}
