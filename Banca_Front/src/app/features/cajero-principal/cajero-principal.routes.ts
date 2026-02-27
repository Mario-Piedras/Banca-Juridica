import { Routes } from '@angular/router';
import { CajeroPrincipalLayoutComponent } from './layout/cajero-principal-layout.component';

// Importar componentes del CAJERO NORMAL
import { SaldoEfectivoComponent } from '../cajero/components/saldo-efectivo/saldo-efectivo.component';
import { SaldoCanjeComponent } from '../cajero/components/saldo-canje/saldo-canje.component';
import { AperturaCuentaComponent } from '../cajero/components/apertura-cuenta/apertura-cuenta.component';
import { ConsignacionComponent } from '../cajero/components/consignacion/consignacion.component';
import { RetiroVentanillaComponent } from '../cajero/components/retiro-ventanilla/retiro-ventanilla.component';
import { NotaDebitoComponent } from '../cajero/components/nota-debito/nota-debito.component';
import { CancelacionCuentaComponent } from '../cajero/components/cancelacion-cuenta/cancelacion-cuenta.component';
import { TrasladoCajeroComponent } from '../cajero/components/traslado-cajero/traslado-cajero.component';
import { ReciboTrasladoComponent } from '../cajero/components/recibo-traslado/recibo-traslado.component';

// Importar componentes EXCLUSIVOS del CAJERO PRINCIPAL
import { SaldosCajerosComponent } from './components/saldos-cajeros/saldos-cajeros.component';
import { SaldoBovedaComponent } from './components/saldo-boveda/saldo-boveda.component';
import { SaldoOficinaComponent } from './components/saldo-oficina/saldo-oficina.component';

export const CAJERO_PRINCIPAL_ROUTES: Routes = [
  {
    path: '',
    component: CajeroPrincipalLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'saldo-efectivo',
        pathMatch: 'full'
      },
      // ===== RUTAS DE CAJERO NORMAL =====
      {
        path: 'saldo-efectivo',
        component: SaldoEfectivoComponent,
        title: 'Saldo en Efectivo'
      },
      {
        path: 'saldo-canje',
        component: SaldoCanjeComponent,
        title: 'Saldo en Canje'
      },
      {
        path: 'apertura-cuenta',
        component: AperturaCuentaComponent,
        title: 'Apertura de Cuenta'
      },
      {
        path: 'consignacion',
        component: ConsignacionComponent,
        title: 'Consignación'
      },
      {
        path: 'retiro-ventanilla',
        component: RetiroVentanillaComponent,
        title: 'Retiro por Ventanilla'
      },
      {
        path: 'nota-debito',
        component: NotaDebitoComponent,
        title: 'Nota Débito'
      },
      {
        path: 'cancelacion-cuenta',
        component: CancelacionCuentaComponent,
        title: 'Cancelación de Cuenta'
      },
      {
        path: 'traslado-cajero',
        component: TrasladoCajeroComponent,
        title: 'Traslado entre Cajeros'
      },
      {
        path: 'recibo-traslado',
        component: ReciboTrasladoComponent,
        title: 'Recibo de Traslado'
      },
      // ===== RUTAS EXCLUSIVAS DE CAJERO PRINCIPAL =====
      {
        path: 'saldos-cajeros',
        component: SaldosCajerosComponent,
        title: 'Saldos de Cajeros - Cajero Principal'
      },
      {
        path: 'saldo-boveda',
        component: SaldoBovedaComponent,
        title: 'Saldo en Bóveda'
      },
      {
        path: 'saldo-oficina', 
        component: SaldoOficinaComponent,
        title: 'Saldo de Oficina'
      }
    ]
  }
];
