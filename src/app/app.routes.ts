import { Routes, CanMatchFn } from '@angular/router';
import { inject } from '@angular/core';
import { jwtAuthGuard } from './core/guards/jwt-auth.guard';
import { AuthService } from './core/services/auth.service';

const isRole = (expected: 'admin' | 'medical' | 'user'): CanMatchFn => () => {
  const auth = inject(AuthService);
  const profile: any = auth.session().profile;
  const role: string | undefined = profile?.sys_role || profile?.role;
  return role === expected;
};

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
        canMatch: [isRole('admin')],
        loadChildren: () => import('./components/admin/admin.routes').then(m => m.adminRoutes),
      },
      {
        path: '',
        canMatch: [isRole('medical')],
        loadChildren: () => import('./components/medical/medical.routes').then(m => m.MEDICAL_ROUTES),
      },
      {
        path: '',
        canMatch: [isRole('user')],
        loadChildren: () => import('./components/patient/patient.routes').then(m => m.PATIENT_ROUTES),
      },
      {
        path: '',
        loadChildren: () => import('./components/admin/admin.routes').then(m => m.adminRoutes),
      },
    ],
  },
  { path: '**', redirectTo: 'auth' },
];
