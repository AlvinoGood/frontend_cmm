import { Routes } from '@angular/router';
import { AdminServicesComponent } from '../admin/services/services.component';
import { AdminPaymentsComponent } from '../admin/payments/payments.component';
import { AdminConsultationsComponent } from '../admin/consultations/consultations.component';
import { AdminHomeComponent } from '../admin/home/home.component';
import { AdminTemplatesComponent } from '../admin/templates/templates.component';

export const MEDICAL_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: AdminHomeComponent, data: { onlyMine: true } },
  { path: 'services', component: AdminServicesComponent, data: { canManage: false } },
  { path: 'payments', component: AdminPaymentsComponent },
  { path: 'encounters', component: AdminConsultationsComponent, data: { canCreate: true } },
  { path: 'medical-record', component: AdminTemplatesComponent, data: { onlyMine: true, canManage: false } },
  { path: 'attended', component: AdminConsultationsComponent, data: { onlyMine: true } },
];
