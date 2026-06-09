import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-asesor-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-100 overflow-hidden">
      <!-- Sidebar -->
      <app-sidebar [menuItems]="asesorMenuItems"></app-sidebar>

      <!-- Contenido principal -->
      <main class="flex-1 min-w-0 w-full overflow-x-hidden ">
        <app-header
          [titulo]="'Panel de Asesor'"
          [subtitulo]="'Sistema de Simulación Bancaria - BankDash'"
        >
        </app-header>

        <div class="p-4 md:p-6 lg:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
})
export class AsesorLayoutComponent {
  asesorMenuItems = [
    {
      titulo: 'Menu asesor',
      items: [
        { label: 'Consultar Cliente', ruta: '/asesor/consultar-cliente' },
        { label: 'Consultar Cliente2', ruta: '/asesor/consultar-cliente2' },
        { label: 'Registrar Cliente Natural', ruta: '/asesor/registrar-cliente' },
        { label: 'Registrar Cliente Jurídico', ruta: '/asesor/registrar-cliente-juridico' },
        { label: 'Solicitar Producto Natural', ruta: '/asesor/solicitar-producto' },
        { label: 'Solicitar Producto Juridico', ruta: '/asesor/solicitar-producto-juridico' },
        { label: 'Solicitudes Radicadas', ruta: '/asesor/solicitudes-radicadas' },
      ],
    },
  ];
}
