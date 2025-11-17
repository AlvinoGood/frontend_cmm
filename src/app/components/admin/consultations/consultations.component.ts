import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EncountersService } from '../../../core/services/encounters.service';
import { UsersService } from '../../../core/services/users.service';
import { AlertService } from '../../../core/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

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
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly usersSvc = inject(UsersService);
  private readonly alerts = inject(AlertService);

  rows = signal<any[]>([]);
  total = signal(0);
  pageIndex = signal(0);
  pageSize = 10;
  searchTerm = signal('');

  viewOpen = signal(false);
  viewing: any | null = null;
  createOpenSig = signal(false);
  dni = signal('');
  searching = signal(false);
  searchError = signal('');
  foundUser: { dni: string; email: string | null } | null = null;
  selectedDni = signal('');
  canCreate = false;
  onlyMine = false;
  doctorDni: string | null = null;

  private items: any[] = [];
  private searchTimer: any;

  ngOnInit(): void {
    const profile: any = this.auth.session().profile;
    const role: string | undefined = profile?.sys_role || profile?.role;
    const isMedical = role === 'medical';
    const data = this.route.snapshot.data as any;
    const routeAllows = (data && typeof data.canCreate !== 'undefined') ? !!data.canCreate : false;
    this.canCreate = isMedical && routeAllows;
    this.onlyMine = !!data?.onlyMine;
    this.doctorDni = profile?.dni ?? null;

    this.svc.list().subscribe(({ items, total }) => {
      const normalized = items.map((e: any) => ({
        id: e.id,
        date: (e.createdAt ?? '').slice(0, 10),
        providerDni: e.provider?.dni,
        patientDni: e.patient?.dni,
        raw: e,
      }));
      const filtered = (this.onlyMine && this.doctorDni)
        ? normalized.filter((r: any) => r.providerDni === this.doctorDni)
        : normalized;
      this.items = filtered;
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

  openCreate() { this.createOpenSig.set(true); this.dni.set(''); this.foundUser = null; this.selectedDni.set(''); this.searchError.set(''); }
  closeCreate() { this.createOpenSig.set(false); this.dni.set(''); this.foundUser = null; this.selectedDni.set(''); this.searchError.set(''); this.searching.set(false); }
  onDniInput(ev: Event) {
    const v = ((ev.target as HTMLInputElement)?.value ?? '').replace(/\D/g, '').slice(0, 8);
    this.dni.set(v);
    this.selectedDni.set('');
    this.foundUser = null;
    if (v.length > 0 && v.length !== 8) this.searchError.set('DNI debe tener 8 dígitos'); else this.searchError.set('');
  }
  doSearch() {
    const v = this.dni();
    if (v.length !== 8) { this.searchError.set('DNI debe tener 8 dígitos'); this.foundUser = null; this.selectedDni.set(''); return; }
    this.searching.set(true);
    this.searchError.set('');
    this.foundUser = null;
    this.selectedDni.set('');
    this.usersSvc.lookupByDni(v).subscribe({
      next: (res) => {
        if (res.exists && res.dni) {
          this.foundUser = { dni: res.dni, email: res.email } as any;
          this.selectedDni.set(res.dni);
          this.alerts.success('Usuario encontrado');
        } else {
          this.searchError.set('Paciente no encontrado');
          this.foundUser = null;
          this.selectedDni.set('');
          this.alerts.error('Paciente no encontrado');
        }
        this.searching.set(false);
      },
      error: () => { this.searching.set(false); this.searchError.set('No se pudo buscar'); this.foundUser = null; this.selectedDni.set(''); this.alerts.error('No se pudo buscar'); }
    });
  }
  confirmCreate() {
    const v = this.selectedDni();
    if (!v) return;
    this.svc.create(v).subscribe({
      next: () => { this.alerts.success('Atención registrada'); this.closeCreate(); this.ngOnInit(); },
      error: () => { this.searchError.set('No se pudo registrar'); }
    });
  }
  onSelectDni(ev: Event) { this.selectedDni.set(((ev.target as HTMLSelectElement)?.value ?? '').trim()); }
}
