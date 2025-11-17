import { Routes } from '@angular/router';
import { AdminServicesComponent } from '../admin/services/services.component';
import { AdminPaymentsComponent } from '../admin/payments/payments.component';
import { PatientMedicalCardsComponent } from './medical-cards/medical-cards.component';

export const PATIENT_ROUTES: Routes = [
  // { path: '', component: PatientDashboardComponent },
  { path: 'services', component: AdminServicesComponent, data: { canManage: false } },
  { path: 'payments', component: AdminPaymentsComponent, data: { onlyMine: true } },
  { path: 'medical-card', component: PatientMedicalCardsComponent },
];
