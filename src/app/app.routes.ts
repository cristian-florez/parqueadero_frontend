import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { LoginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  // 1. Ruta de login (pública)
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },

  // 2. Rutas protegidas por AuthGuard
  {
    path: 'tabla',
    loadComponent: () =>
      import('./components/tabla/tabla.component').then(
        (m) => m.TablaComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'salida',
    loadComponent: () =>
      import('./components/salida/salida.component').then(
        (m) => m.SalidaComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'entrada',
    loadComponent: () =>
      import('./components/entrada/entrada.component').then(
        (m) => m.EntradaComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'total',
    loadComponent: () =>
      import('./components/total/total.component').then(
        (m) => m.TotalComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'turnos',
    loadComponent: () =>
      import('./components/turnos/turnos.component').then(
        (m) => m.TurnosComponent
      ),
    canActivate: [AuthGuard],
  },

  // 3. Redirección raíz -> tabla (protegida)
  { path: '', redirectTo: 'tabla', pathMatch: 'full' },

  // 4. Ruta comodín -> tabla (también protegida)
  { path: '**', redirectTo: 'tabla' },
];
