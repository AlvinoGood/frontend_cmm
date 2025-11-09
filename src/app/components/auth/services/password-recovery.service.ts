import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PasswordRecoveryService {
  private readonly http = inject(HttpClient);
  private get base() { return environment.apiUrl; }

  request(email: string) {
    return this.http.post<void>(`${this.base}/auth/forgot-password`, { email });
  }

  reset(token: string, newPassword: string) {
    return this.http.post<void>(`${this.base}/auth/reset-password`, { token, newPassword });
  }
}

