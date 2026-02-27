import { Routes } from '@angular/router';
import { CajeroLayoutComponent } from './layout/cajero-layout.component';

export const CAJERO_ROUTES: Routes = [
  {
    path: '',
    component: CajeroLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'saldo-efectivo',
        pathMatch: 'full'
      },
      {
        path: 'saldo-efectivo',
        loadComponent: () => import('./components/saldo-efectivo/saldo-efectivo.component')
          .then(m => m.SaldoEfectivoComponent)
      },
      {
        path: 'saldo-canje',
        loadComponent: () => import('./components/saldo-canje/saldo-canje.component')
          .then(m => m.SaldoCanjeComponent)
      },
      {
        path: 'apertura-cuenta',
        loadComponent: () => import('./components/apertura-cuenta/apertura-cuenta.component')
          .then(m => m.AperturaCuentaComponent)
      },
      {
        path: 'consignacion',
        loadComponent: () => import('./components/consignacion/consignacion.component')
          .then(m => m.ConsignacionComponent)
      },
      {
        path: 'retiro-ventanilla',
        loadComponent: () => import('./components/retiro-ventanilla/retiro-ventanilla.component')
          .then(m => m.RetiroVentanillaComponent)
      },
      {
        path: 'nota-debito',
        loadComponent: () => import('./components/nota-debito/nota-debito.component')
          .then(m => m.NotaDebitoComponent)
      },
      {
        path: 'cancelacion-cuenta',
        loadComponent: () => import('./components/cancelacion-cuenta/cancelacion-cuenta.component')
          .then(m => m.CancelacionCuentaComponent)
      },
      {
        path: 'traslado-cajero',  // ← AGREGAR
        loadComponent: () => import('./components/traslado-cajero/traslado-cajero.component')
          .then(m => m.TrasladoCajeroComponent)
      },
      {
        path: 'recibo-traslado',  // ← AGREGAR
        loadComponent: () => import('./components/recibo-traslado/recibo-traslado.component')
          .then(m => m.ReciboTrasladoComponent)
      }
    ]
  }
];
