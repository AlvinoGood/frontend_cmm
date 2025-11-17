import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private get base() { return environment.apiUrl; }

  list(limit = 100, offset = 0) {
    const params = new HttpParams().set('limit', String(limit)).set('offset', String(offset));
    return this.http.get<any>(`${this.base}/users`, { params }).pipe(
      map((r) => {
        const items = r?.data?.items ?? r?.items ?? r?.results ?? [];
        const total = r?.data?.total ?? r?.total ?? items.length + offset;
        return { items, total } as { items: any[]; total: number };
      })
    );
  }

  create(body: any) {
    return this.http.post(`${this.base}/users`, body);
  }

  update(id: number, body: any) {
    return this.http.patch(`${this.base}/users/${id}`, body);
  }

  remove(id: number) {
    return this.http.delete(`${this.base}/users/${id}`);
  }

  promoteMedical(id: number, medicalRoleId: number) {
    return this.http.patch(`${this.base}/users/${id}/promote-medical`, { medicalRoleId });
  }

  lookupByDni(dni: string) {
    return this.http.get<any>(`${this.base}/users/lookup/${dni}`).pipe(
      map((r) => {
        const data = r?.data ?? {};
        return {
          exists: !!data.exists,
          dni: data.dni ?? null,
          email: data.email ?? null,
        } as { exists: boolean; dni: string | null; email: string | null };
      })
    );
  }
}
