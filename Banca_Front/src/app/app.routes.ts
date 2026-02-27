import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'asesor',
    loadChildren: () =>
      import('./features/asesor/asesor.routes').then(m => m.ASESOR_ROUTES),
    canActivate: [roleGuard],
    data: { role: 'Asesor' }
  },
  {
    path: 'director-operativo',
    loadChildren: () =>
      import('./features/director-operativo/director-operativo.routes').then(
        m => m.DIRECTOR_OPERATIVO_ROUTES
      ),
    canActivate: [roleGuard],
    data: { role: 'Director-operativo' }
  },
   {
    path: 'cajero',
    loadChildren: () =>
      import('./features/cajero/cajero.routes').then(m => m.CAJERO_ROUTES),
    canActivate: [roleGuard],
    data: { role: 'Cajero' }
  },
  {
    path: 'cajero-principal',
    loadChildren: () =>
      import('./features/cajero-principal/cajero-principal.routes').then(m => m.CAJERO_PRINCIPAL_ROUTES),
    canActivate: [roleGuard],
    data: { role: 'Cajero-Principal' }
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];