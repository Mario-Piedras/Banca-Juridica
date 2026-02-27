import { Routes } from '@angular/router';
import { DirectorOperativoLayoutComponent } from './layout/director-operativo-layout.component';

export const DIRECTOR_OPERATIVO_ROUTES: Routes = [
  {
    path: '',
    component: DirectorOperativoLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'consultar-solicitudes',
        pathMatch: 'full'
      },
      {
        path: 'consultar-solicitudes',
        loadComponent: () =>
          import('./components/solicitudes-radicadas/consultar-solicitudes.component').then(
            (m) => m.ConsultarSolicitudesComponent
          ),
      }
      ,
      {
        path: 'solicitud/:id',
        loadComponent: () =>
          import('./components/solicitudes-radicadas/solicitud-cliente/solicitud-cliente.component').then(
            (m) => m.SolicitudClienteComponent
          )
      }
    ]
  }
];

