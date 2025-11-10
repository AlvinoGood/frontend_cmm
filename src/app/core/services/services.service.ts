import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ServiceItem {
  id: number;
  name: string;
  code?: string;
  price: number;
  specialty?: string;
}

@Injectable({ providedIn: 'root' })
export class ServicesService {
  private readonly http = inject(HttpClient);
  private get base() { return environment.apiUrl; }

  list(limit = 100, offset = 0) {
    let params = new HttpParams().set('limit', String(limit)).set('offset', String(offset));
    return this.http
      .get<any>(`${this.base}/services`, { params })
      .pipe(
        map((r) => {
          const items = r?.data?.items ?? r?.items ?? r?.results ?? [];
          const total = r?.data?.total ?? r?.total ?? items.length + offset;
          return { items, total } as { items: any[]; total: number };
        })
      );
  }

  create(body: any) {
    return this.http.post(`${this.base}/services`, body);
  }

  update(id: number, body: any) {
    return this.http.patch(`${this.base}/services/${id}`, body);
  }

  remove(id: number) {
    return this.http.delete(`${this.base}/services/${id}`);
  }
}
