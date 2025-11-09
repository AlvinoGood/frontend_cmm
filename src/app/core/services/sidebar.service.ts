import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import type { NavItem } from '../models/nav-item.model';
import { NAV_ADMIN, NAV_MEDICAL, NAV_USER } from '../constants/nav';

type Role = 'user' | 'medical' | 'admin';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly auth = inject(AuthService);

  readonly role: Signal<Role> = computed(() => {
    const profile = this.auth.session().profile as any | undefined;
    const r: string | undefined = profile?.sys_role || profile?.role || 'user';
    return (['user', 'medical', 'admin'].includes(r as any) ? (r as Role) : 'user');
  });

  readonly items: Signal<NavItem[]> = computed(() => {
    const role = this.role();
    switch (role) {
      case 'medical':
        return NAV_MEDICAL;
      case 'admin':
        return NAV_ADMIN;
      case 'user':
      default:
        return NAV_USER;
    }
  });
}

