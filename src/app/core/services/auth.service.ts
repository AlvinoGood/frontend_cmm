import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { decodeJwt } from '../helpers/jwt';

type LoginDto = { dni: string; password: string };
type RegisterDto = { dni: string; email: string; password: string };
type RefreshDto = { refreshToken: string };

type Tokens = { accessToken: string; refreshToken: string };

type Session = {
  accessToken: string | null;
  refreshToken: string | null;
  profile?: any | null;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly sessionSig = signal<Session>({ accessToken: null, refreshToken: null });
  readonly session = this.sessionSig.asReadonly();
  readonly isAuthenticated: Signal<boolean> = computed(() => {
    const t = this.sessionSig().accessToken;
    if (!t || t === 'undefined' || t === 'null') return false;
    if (t.split('.').length !== 3) return false;
    const decoded: any = decodeJwt(t) || {};
    const expMs = decoded?.exp ? decoded.exp * 1000 : undefined;
    if (expMs && expMs <= Date.now()) return false;
    return true;
  });

  private get base() {
    return environment.apiUrl;
  }

  login(dto: LoginDto) {
    return this.http.post<Tokens>(`${this.base}/auth/login`, dto);
  }

  register(dto: RegisterDto) {
    return this.http.post<Tokens>(`${this.base}/auth/register`, dto);
  }

  refresh(dto: RefreshDto) {
    return this.http.post<Tokens>(`${this.base}/auth/refresh`, dto);
  }

  forgot(email: string) {
    return this.http.post<void>(`${this.base}/auth/forgot-password`, { email });
  }

  reset(token: string, newPassword: string) {
    return this.http.post<void>(`${this.base}/auth/reset-password`, { token, newPassword });
  }

  setTokens(input: any) {
    const accessToken: string | null = input?.accessToken ?? input?.data?.accessToken ?? null;
    const refreshToken: string | null = input?.refreshToken ?? input?.data?.refreshToken ?? null;
    if (!accessToken || !refreshToken) {
      return;
    }
    this.sessionSig.update((s) => ({ ...s, accessToken, refreshToken }));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this.decodeRoles(accessToken);
    const user = input?.user ?? input?.data?.user;
    if (user) {
      const roleName = user?.role?.name ?? user?.role;
      this.sessionSig.update((s) => ({
        ...s,
        profile: { ...(s.profile ?? {}), email: user.email, dni: user.dni, role: roleName },
      }));
    }
  }

  loadFromStorage() {
    const rawAccess = localStorage.getItem('accessToken');
    const rawRefresh = localStorage.getItem('refreshToken');
    const accessToken = this.normalizeToken(rawAccess);
    const refreshToken = this.normalizeToken(rawRefresh);

    if (!accessToken) {
      this.clear();
      return;
    }

    // Validate shape and expiration
    if (accessToken.split('.').length !== 3) {
      this.clear();
      return;
    }
    const decoded: any = decodeJwt(accessToken) || {};
    const expMs = decoded?.exp ? decoded.exp * 1000 : undefined;
    if (expMs && expMs <= Date.now()) {
      this.clear();
      return;
    }

    this.sessionSig.set({ accessToken, refreshToken, profile: undefined });
    this.decodeRoles(accessToken);
  }

  private normalizeToken(t: string | null): string | null {
    if (!t) return null;
    const v = t.trim();
    if (!v || v === 'undefined' || v === 'null') return null;
    return v;
  }

  clear() {
    this.sessionSig.set({ accessToken: null, refreshToken: null, profile: null });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private decodeRoles(accessToken: string) {
    const decoded = decodeJwt(accessToken) || {};
    this.sessionSig.update((s) => ({ ...s, profile: decoded }));
  }
}
