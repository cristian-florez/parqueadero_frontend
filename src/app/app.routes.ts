import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'tabla', pathMatch: 'full' },
  {
    path: 'tabla',
    loadComponent: () =>
      import('./components/tabla/tabla.component').then(m => m.TablaComponent)
  },
  {
    path: 'salida',
    loadComponent: () =>
      import('./components/salida/salida.component').then(m => m.SalidaComponent)
  },
  {
    path: 'entrada',
    loadComponent: () =>
      import('./components/entrada/entrada.component').then(m => m.EntradaComponent)
  },
  {
    path: 'total',
    loadComponent: () =>
      import('./components/total/total.component').then(m => m.TotalComponent)
  }
];
