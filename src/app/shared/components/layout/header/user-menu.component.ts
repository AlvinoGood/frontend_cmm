import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  profileOpen = signal(false);
  readonly session = this.auth.session;
  readonly profile = computed(() => this.session().profile ?? {});

  openProfile() {
    this.profileOpen.set(true);
  }

  closeProfile() {
    this.profileOpen.set(false);
  }

  roleSistema(): string | null {
    const raw = (this.profile() as any)?.role;
    if (!raw) return null;
    const name = String(raw).toLowerCase();
    if (name === 'user') return null;
    if (name === 'admin') return 'Administrador';
    if (name === 'medical') return 'Médico';
    return raw;
  }

  onLogout() {
    this.auth.clear();
    this.router.navigateByUrl('/auth/login');
  }
}
