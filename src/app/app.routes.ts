import { Routes } from '@angular/router';
import { jwtAuthGuard } from './core/guards/jwt-auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  {
    path: 'auth',
    loadChildren: () => import('./components/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./shared/components/layout/app-shell/app-shell.component').then(
        (m) => m.AppShellComponent
      ),
    canActivate: [jwtAuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./components/admin/admin.routes').then(m => m.adminRoutes),
      },
    ],
  },
  { path: '**', redirectTo: 'auth' },
];
