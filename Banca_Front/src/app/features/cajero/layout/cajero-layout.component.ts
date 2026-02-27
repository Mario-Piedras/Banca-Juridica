import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-cajero-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-100 overflow-hidden">
      <app-sidebar [menuItems]="cajeroMenuItems"></app-sidebar>

      <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <app-header
          [titulo]="'Panel de Cajero'"
          [subtitulo]="'Sistema de Simulación Bancaria - Banca Uno'">
        </app-header>

        <div class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class CajeroLayoutComponent {
  cajeroMenuItems = [
    {
      titulo: 'Cuenta de Ahorros',
      items: [
        { label: 'Saldo Ventanilla Efectivo', ruta: '/cajero/saldo-efectivo' },
        { label: 'Saldo Canje', ruta: '/cajero/saldo-canje' },
        { label: 'Apertura de cuenta', ruta: '/cajero/apertura-cuenta' },
        { label: 'Consignación', ruta: '/cajero/consignacion' },
        { label: 'Retiro por ventanilla', ruta: '/cajero/retiro-ventanilla' },
        { label: 'Nota débito', ruta: '/cajero/nota-debito' },
        { label: 'Cancelación de cuenta', ruta: '/cajero/cancelacion-cuenta' },
        { label: 'Traslado Cajero', ruta: '/cajero/traslado-cajero' },        //
        { label: 'Recibo Traslado', ruta: '/cajero/recibo-traslado' }
      ]
    }
  ];
}
