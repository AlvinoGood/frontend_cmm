import { Routes } from '@angular/router';
import { MedicalServicesComponent } from './services/services.component';

export const MEDICAL_ROUTES: Routes = [
  // { path: '', component: MedicalDashboardComponent },
  { path: 'services', component: MedicalServicesComponent },
];
