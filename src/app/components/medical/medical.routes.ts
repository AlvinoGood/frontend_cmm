import { Routes } from '@angular/router';
import { AdminServicesComponent } from '../admin/services/services.component';
import { AdminPaymentsComponent } from '../admin/payments/payments.component';
import { AdminConsultationsComponent } from '../admin/consultations/consultations.component';

export const MEDICAL_ROUTES: Routes = [
  // { path: '', component: MedicalDashboardComponent },
  { path: 'services', component: AdminServicesComponent, data: { canManage: false } },
  { path: 'payments', component: AdminPaymentsComponent },
  { path: 'encounters', component: AdminConsultationsComponent },
];
