import { Routes } from '@angular/router';
import { AdminServicesComponent } from './services/services.component';

export const adminRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'services' },
  { path: 'services', component: AdminServicesComponent },
];

