import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EncountersService } from '../../../core/services/encounters.service';

@Component({
  selector: 'app-admin-consultations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultations.component.html',
  styleUrl: './consultations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminConsultationsComponent implements OnInit {
  private readonly svc = inject(EncountersService);

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
    this.svc.list().subscribe(({ items, total }) => {
      const normalized = items.map((e: any) => ({
        id: e.id,
        date: (e.createdAt ?? '').slice(0, 10),
        providerDni: e.provider?.dni,
        patientDni: e.patient?.dni,
        raw: e,
      }));
      this.items = normalized;
      this.total.set(total);
      this.applyFilterPage();
    });
  }

  private applyFilterPage() {
    const term = this.searchTerm().toLowerCase();
    const filtered = term
      ? this.items.filter((r) => String(r.patientDni ?? '').toLowerCase().includes(term) || String(r.date ?? '').toLowerCase().includes(term))
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

