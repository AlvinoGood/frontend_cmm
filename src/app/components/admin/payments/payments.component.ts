import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentsService } from '../../../core/services/payments.service';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPaymentsComponent implements OnInit {
  private readonly svc = inject(PaymentsService);

  rows = signal<any[]>([]);
  total = signal(0);
  pageIndex = signal(0);
  pageSize = 10;
  searchTerm = signal('');

  viewOpen = signal(false);
  viewing: any | null = null;

  private items: any[] = [];
  private searchTimer: any;

  ngOnInit(): void {
    this.svc.listTickets().subscribe(({ items, total }) => {
      const normalized = items.map((t: any) => ({
        id: t.id,
        date: (t.createdAt ?? '').slice(0, 10),
        userDni: t.user?.dni,
        serviceName: t.service?.name,
        serviceCode: t.service?.code,
        servicePrice: t.service?.price,
        status: t.status,
        raw: t,
      }));
      this.items = normalized;
      this.total.set(total);
      this.applyFilterPage();
    });
  }

  private applyFilterPage() {
    const term = this.searchTerm().toLowerCase();
    const filtered = term
      ? this.items.filter((r) =>
          String(r.userDni ?? '').toLowerCase().includes(term) ||
          String(r.date ?? '').toLowerCase().includes(term)
        )
      : this.items;
    const start = this.pageIndex() * this.pageSize;
    this.rows.set(filtered.slice(start, start + this.pageSize));
    this.total.set(filtered.length);
  }

  prevPage() {
    if (this.pageIndex() === 0) return;
    this.pageIndex.update((i) => i - 1);
    this.applyFilterPage();
  }

  nextPage() {
    if ((this.pageIndex() + 1) * this.pageSize >= this.total()) return;
    this.pageIndex.update((i) => i + 1);
    this.applyFilterPage();
  }

  onSearchInput(ev: Event) {
    const value = (ev.target as HTMLInputElement)?.value ?? '';
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.searchTerm.set(value.trim());
      this.pageIndex.set(0);
      this.applyFilterPage();
    }, 1500);
  }

  openView(row: any) {
    this.viewing = row?.raw ?? null;
    this.viewOpen.set(true);
  }

  closeView() {
    this.viewOpen.set(false);
    this.viewing = null;
  }
}
