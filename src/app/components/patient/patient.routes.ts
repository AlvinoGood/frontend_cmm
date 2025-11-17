import { Routes } from '@angular/router';
import { AdminServicesComponent } from '../admin/services/services.component';
import { AdminPaymentsComponent } from '../admin/payments/payments.component';
import { PatientMedicalCardsComponent } from './medical-cards/medical-cards.component';
import { PatientHomeComponent } from './home/home.component';

export const PATIENT_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: PatientHomeComponent },
  { path: 'services', component: AdminServicesComponent, data: { canManage: false } },
  { path: 'payments', component: AdminPaymentsComponent, data: { onlyMine: true } },
  { path: 'medical-card', component: PatientMedicalCardsComponent },
];
