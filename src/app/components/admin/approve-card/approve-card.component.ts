import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalCardsService } from '../../../core/services/medical-cards.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-admin-approve-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './approve-card.component.html',
  styleUrl: './approve-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminApproveCardComponent implements OnInit {
  private readonly svc = inject(MedicalCardsService);
  private readonly auth = inject(AuthService);
  private readonly alerts = inject(AlertService);

  rows = signal<any[]>([]);
  total = signal(0);
  pageIndex = signal(0);
  pageSize = 10;
  searchTerm = signal('');

  statusOpen = signal(false);
  selectedId: number | null = null;
  selectedStatus: 'pending' | 'paid' = 'pending';
  canChangeStatus = false;
  confirmOpen = signal(false);
  confirming = signal(false);

  private items: any[] = [];
  private searchTimer: any;

  ngOnInit(): void {
    const profile: any = this.auth.session().profile;
    const role: string | undefined = profile?.sys_role || profile?.role;
    this.canChangeStatus = role === 'medical';

    this.svc.list(500, 0).subscribe(({ items, total }) => {
      const normalized = (items ?? []).map((it: any) => ({
        id: it.id ?? it.medical_card_id ?? null,
        createdAt: (it.created_at ?? it.createdAt ?? '').slice(0, 10),
        userDni: it.p_user_id ?? it.user_dni ?? '',
        status: it.status ?? it.paid ?? 'pending',
        age: it.age ?? '',
        workPlace: it.work_place ?? '',
        area: it.area ?? '',
        careDate: (it.care_date ?? '').slice(0, 10),
        expirationDate: (it.expiration_date ?? '').slice(0, 10),
        raw: it,
      }));
      this.items = normalized;
      this.total.set(total ?? normalized.length);
      this.applyFilterPage();
    });
  }

  private applyFilterPage() {
    const term = this.searchTerm().toLowerCase();
    const filtered = term
      ? this.items.filter((r) =>
          String(r.userDni ?? '').toLowerCase().includes(term) ||
          String(r.createdAt ?? '').toLowerCase().includes(term)
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

  openStatus(row: any) {
    if (!this.canChangeStatus) return;
    this.selectedId = row?.id ?? null;
    this.selectedStatus = (row?.status as any) ?? 'pending';
    this.statusOpen.set(true);
  }

  closeStatus() {
    this.statusOpen.set(false);
    this.selectedId = null;
  }

  onStatusSelect(ev: Event) {
    const v = (ev.target as HTMLSelectElement)?.value as any;
    if (v === 'pending' || v === 'paid') this.selectedStatus = v;
  }

  openFinalConfirm() { this.confirmOpen.set(true); }
  closeFinalConfirm() { this.confirmOpen.set(false); }
  doConfirmStatus() {
    if (!this.selectedId) return;
    this.confirming.set(true);
    this.svc.updateStatus(this.selectedId, this.selectedStatus).subscribe({
      next: () => {
        this.items = this.items.map((it) => it.id === this.selectedId ? { ...it, status: this.selectedStatus } : it);
        this.applyFilterPage();
        this.alerts.success('Estado actualizado');
        this.closeFinalConfirm();
        this.closeStatus();
      },
      error: () => {
        this.alerts.error('No se pudo actualizar');
        this.closeFinalConfirm();
        this.closeStatus();
      }
    }).add(() => this.confirming.set(false));
  }
}
