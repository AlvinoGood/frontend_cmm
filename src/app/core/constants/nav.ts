import type { NavItem } from '../models/nav-item.model';

export const NAV_USER: NavItem[] = [
  { id: 'home', label: 'Inicio', path: '/app/home', icon: 'fa-solid fa-house', roles: ['user'] },
  { id: 'services', label: 'Servicios', path: '/app/services', icon: 'fa-solid fa-briefcase-medical', roles: ['user'] },
  { id: 'payments', label: 'Pagos', path: '/app/payments', icon: 'fa-solid fa-credit-card', roles: ['user'] },
  { id: 'medical-card', label: 'Tarjetas médicas', path: '/app/medical-card', icon: 'fa-solid fa-id-card', roles: ['user'] },
];

export const NAV_MEDICAL: NavItem[] = [
  { id: 'home', label: 'Inicio', path: '/app/home', icon: 'fa-solid fa-house', roles: ['medical'] },
  { id: 'encounters', label: 'Atenciones', path: '/app/encounters', icon: 'fa-solid fa-stethoscope', roles: ['medical'] },
  { id: 'services', label: 'Servicios', path: '/app/services', icon: 'fa-solid fa-briefcase-medical', roles: ['medical'] },
  { id: 'payments', label: 'Pagos', path: '/app/payments', icon: 'fa-solid fa-credit-card', roles: ['medical'] },
  { id: 'medical-record', label: 'Mi Ficha Médica', path: '/app/medical-record', icon: 'fa-solid fa-notes-medical', roles: ['medical'] },
  { id: 'approve-card', label: 'Aprobar carne Medico', path: '/app/approve-card', icon: 'fa-solid fa-check-to-slot', roles: ['medical'] },
  { id: 'attended', label: 'Pacientes atendidos', path: '/app/attended', icon: 'fa-solid fa-users', roles: ['medical'] },
];

export const NAV_ADMIN: NavItem[] = [
  { id: 'home', label: 'Inicio', path: '/app/home', icon: 'fa-solid fa-house', roles: ['admin'] },
  { id: 'encounters', label: 'Atenciones', path: '/app/encounters', icon: 'fa-solid fa-stethoscope', roles: ['admin'] },
  { id: 'services', label: 'Servicios', path: '/app/services', icon: 'fa-solid fa-briefcase-medical', roles: ['admin'] },
  { id: 'medical-roles', label: 'Roles Médicos', path: '/app/medical-roles', icon: 'fa-solid fa-user-doctor', roles: ['admin'] },
  { id: 'payments', label: 'Pagos', path: '/app/payments', icon: 'fa-solid fa-credit-card', roles: ['admin'] },
  { id: 'users', label: 'Usuarios', path: '/app/users', icon: 'fa-solid fa-users', roles: ['admin'] },
  { id: 'templates', label: 'Plantillas', path: '/app/templates', icon: 'fa-solid fa-file-lines', roles: ['admin'] },
];
