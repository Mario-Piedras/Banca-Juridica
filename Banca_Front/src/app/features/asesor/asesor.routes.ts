import { Routes } from '@angular/router';
import { AsesorLayoutComponent } from './layout/asesor-layout.component';

export const ASESOR_ROUTES: Routes = [
  {
    path: '',
    component: AsesorLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'consultar-cliente',
        pathMatch: 'full'
      },
         {
        path: 'consultar-cliente',
        loadComponent: () =>
          import('./components/consultar-cliente/consultar-cliente.component').then(
            (m) => m.ConsultarClienteComponent
          ),
      },
       {
        path: 'registrar-cliente',
        loadComponent: () =>
          import('./components/registrar-cliente/registrar-cliente.component').then(
            (m) => m.RegistrarClienteComponent
          ),
      },
      {
        path: 'editar-cliente/:id', // ← NUEVA RUTA PARA EDICIÓN
        loadComponent: () =>
          import('./components/registrar-cliente/registrar-cliente.component').then(
            (m) => m.RegistrarClienteComponent
          ),
      },

      {
        path: 'solicitar-producto',
        loadComponent: () =>
          import('./components/solicitar-producto/solicitar-producto.component').then(
            (m) => m.SolicitarProductoComponent
          ),
      },
      {
        path: 'solicitudes-radicadas',
        loadComponent: () =>
          import('./components/solicitudes-radicadas/solicitudes-radicadas.component').then(
            (m) => m.SolicitudesRadicadasComponent
          ),
      }
    ]
  }
];

