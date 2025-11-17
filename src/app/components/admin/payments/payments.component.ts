import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentsService } from '../../../core/services/payments.service';
import { AuthService } from '../../../core/services/auth.service';

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
  private readonly auth = inject(AuthService);

  rows = signal<any[]>([]);
  total = signal(0);
  pageIndex = signal(0);
  pageSize = 10;
  searchTerm = signal('');

  viewOpen = signal(false);
  viewing: any | null = null;
  statusOpen = signal(false);
  selectedTicketId: number | null = null;
  selectedStatus: 'pending' | 'paid' | 'expired' = 'pending';
  canChangeStatus = false;

  private items: any[] = [];
  private searchTimer: any;

  ngOnInit(): void {
    const profile: any = this.auth.session().profile;
    const role: string | undefined = profile?.sys_role || profile?.role;
    this.canChangeStatus = role === 'medical';

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

  openStatus(row: any) {
    if (!this.canChangeStatus) return;
    this.selectedTicketId = row?.id ?? null;
    this.selectedStatus = (row?.status as any) ?? 'pending';
    this.statusOpen.set(true);
  }

  closeStatus() {
    this.statusOpen.set(false);
    this.selectedTicketId = null;
  }

  onStatusSelect(ev: Event) {
    const v = (ev.target as HTMLSelectElement)?.value as any;
    if (v === 'pending' || v === 'paid' || v === 'expired') this.selectedStatus = v;
  }

  confirmStatus() {
    if (!this.selectedTicketId) return;
    this.svc.updateTicketStatus(this.selectedTicketId, this.selectedStatus).subscribe({
      next: () => {
        this.items = this.items.map((it) => it.id === this.selectedTicketId ? { ...it, status: this.selectedStatus } : it);
        this.applyFilterPage();
        this.closeStatus();
      },
      error: () => {
        this.closeStatus();
      }
    });
  }
}
