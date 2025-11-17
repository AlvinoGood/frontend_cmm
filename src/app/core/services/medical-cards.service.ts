import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MedicalCardsService {
  private readonly http = inject(HttpClient);
  private get base() { return environment.apiUrl; }

  listMine() {
    return this.http.get<any>(`${this.base}/medical-cards/me`).pipe(
      map((r) => {
        const items = r?.data?.items ?? r?.items ?? r?.results ?? [];
        const total = r?.data?.total ?? r?.total ?? items.length;
        return { items, total } as { items: any[]; total: number };
      })
    );
  }

  create(body: any) {
    return this.http.post(`${this.base}/medical-cards`, body);
  }
}

