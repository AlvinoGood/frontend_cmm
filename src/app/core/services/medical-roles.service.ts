import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MedicalRolesService {
  private readonly http = inject(HttpClient);
  private get base() { return environment.apiUrl; }

  list(limit = 20, offset = 0) {
    const params = new HttpParams().set('limit', String(limit)).set('offset', String(offset));
    return this.http.get<any>(`${this.base}/medical-roles`, { params }).pipe(
      map((r) => r?.data?.items ?? r?.items ?? r?.results ?? [])
    );
  }
}

