import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-director-operativo-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-100 overflow-hidden">
      <!-- Sidebar -->
      <app-sidebar [menuItems]="directorOperativoMenuItems"></app-sidebar>

      <!-- Contenido principal -->
      <main class="flex-1 min-w-0 w-full overflow-x-hidden ">
        <app-header
          [titulo]="'Panel de Director Operativo'"
          [subtitulo]="'Sistema de Simulación Bancaria - Banca Uno'"
        >
        </app-header>

        <div class="p-4 md:p-6 lg:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
})
export class DirectorOperativoLayoutComponent {
  directorOperativoMenuItems = [
    {
      titulo: 'Menu Director Operativo',
      items: [
        { label: 'Solicitudes Radicadas', ruta: 'consultar-solicitudes' },
      ],
    },
  ];
}

