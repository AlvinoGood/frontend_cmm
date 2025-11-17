import { Routes } from '@angular/router';
import { AdminServicesComponent } from './services/services.component';
import { AdminMedicalRolesComponent } from './medical-roles/medical-roles.component';
import { AdminUsersComponent } from './users/users.component';
import { AdminTemplatesComponent } from './templates/templates.component';
import { AdminPaymentsComponent } from './payments/payments.component';
import { AdminConsultationsComponent } from './consultations/consultations.component';
import { AdminHomeComponent } from './home/home.component';

export const adminRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: AdminHomeComponent },
  { path: 'services', component: AdminServicesComponent, data: { canManage: true } },
  { path: 'medical-roles', component: AdminMedicalRolesComponent },
  { path: 'users', component: AdminUsersComponent },
  { path: 'payments', component: AdminPaymentsComponent },
  { path: 'encounters', component: AdminConsultationsComponent },
  { path: 'templates', component: AdminTemplatesComponent },
];
