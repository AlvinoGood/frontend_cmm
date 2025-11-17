import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly http = inject(HttpClient);
  private get base() { return environment.apiUrl; }

  listTickets() {
    return this.http.get<any>(`${this.base}/payments/tickets`).pipe(
      map((r) => {
        const items = r?.data?.items ?? r?.items ?? r?.results ?? [];
        const total = r?.data?.total ?? r?.total ?? items.length;
        return { items, total } as { items: any[]; total: number };
      })
    );
  }

  updateTicketStatus(id: number, status: 'pending' | 'paid' | 'expired') {
    return this.http.patch(`${this.base}/payments/tickets/${id}/status`, { status });
  }
}
