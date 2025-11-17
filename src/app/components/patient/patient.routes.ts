import { Routes } from '@angular/router';
import { AdminServicesComponent } from '../admin/services/services.component';

export const PATIENT_ROUTES: Routes = [
  // { path: '', component: PatientDashboardComponent },
  { path: 'services', component: AdminServicesComponent, data: { canManage: false } },
];
