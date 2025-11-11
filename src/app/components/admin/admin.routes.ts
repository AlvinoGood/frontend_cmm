import { Routes } from '@angular/router';
import { AdminServicesComponent } from './services/services.component';
import { AdminMedicalRolesComponent } from './medical-roles/medical-roles.component';
import { AdminUsersComponent } from './users/users.component';

export const adminRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'services' },
  { path: 'services', component: AdminServicesComponent },
  { path: 'medical-roles', component: AdminMedicalRolesComponent },
  { path: 'users', component: AdminUsersComponent },
];
