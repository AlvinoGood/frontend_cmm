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
  readonly isAuthenticated: Signal<boolean> = computed(() => !!this.sessionSig().accessToken);

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

  setTokens(tokens: Tokens) {
    this.sessionSig.update((s) => ({ ...s, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }));
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    this.decodeRoles(tokens.accessToken);
  }

  loadFromStorage() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    this.sessionSig.set({ accessToken, refreshToken, profile: undefined });
    if (accessToken) this.decodeRoles(accessToken);
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

