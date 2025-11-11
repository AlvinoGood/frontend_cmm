import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, DataTableHeader } from '../../../shared/components/ui/data-table/data-table.component';
import { ConfirmModalComponent } from '../../../shared/components/ui/confirm-modal/confirm-modal.component';
import { UsersService } from '../../../core/services/users.service';
import { MedicalRolesService } from '../../../core/services/medical-roles.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, ConfirmModalComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent implements OnInit {
  private readonly svc = inject(UsersService);
  private readonly rolesSvc = inject(MedicalRolesService);
  private readonly alerts = inject(AlertService);

  headers: DataTableHeader[] = [
    { label: 'Id', key: 'id' },
    { label: 'DNI', key: 'dni' },
    { label: 'Correo Electrónico', key: 'email' },
    { label: 'Rol de Sistema', key: 'systemRoleName' },
    { label: 'Rol Médico', key: 'medicalRoleName' },
  ];

  rows = signal<any[]>([]);
  pageSize = 10;
  pageIndex = signal(0);
  total = signal(0);
  searchTerm = signal('');

  viewOpen = signal(false);
  editOpen = signal(false);
  deleteOpen = signal(false);
  promoteOpen = signal(false);

  viewing: any | null = null;
  editing: any | null = null;
  deleting: any | null = null;
  promoting: any | null = null;

  roles = signal<any[]>([]);
  selectedRoleId = signal<number | null>(null);
  confirmPromoteOpen = signal(false);

  ngOnInit(): void {
    this.load();
    this.rolesSvc.list(50, 0).subscribe({ next: (items) => this.roles.set(items ?? []), error: () => this.roles.set([]) });
  }

  private batch = 100;
  private load(): void {
    const uiIndex = this.pageIndex();
    const absoluteOffset = uiIndex * this.pageSize;
    const batchIndex = Math.floor(absoluteOffset / this.batch);
    const offset = batchIndex * this.batch;
    const sliceStart = absoluteOffset - offset;
    this.svc.list(this.batch, offset).subscribe(({ items, total }) => {
      const normalized = items.map((u: any) => {
        const systemRole = u.role?.name ?? u.systemRole?.name ?? u.sys_role?.name ?? '';
        const isMedical = (systemRole || '').toLowerCase() === 'medical';
        const medicalName = u.medicalRole?.specialtyName ?? u.medical_role?.specialty_name ?? null;
        return {
          id: u.id ?? u.user_id,
          dni: u.dni,
          email: u.email,
          systemRoleName: systemRole || 'No definido',
          medicalRoleName: isMedical ? (medicalName || 'No definido') : 'No definido',
        };
      });
      const term = this.searchTerm().toLowerCase();
      const filtered = term
        ? normalized.filter((r) =>
            String(r.dni).includes(term) ||
            String(r.id).includes(term) ||
            String(r.email ?? '').toLowerCase().includes(term) ||
            String(r.systemRoleName ?? '').toLowerCase().includes(term) ||
            String(r.medicalRoleName ?? '').toLowerCase().includes(term)
          )
        : normalized;
      this.rows.set(filtered.slice(sliceStart, sliceStart + this.pageSize));
      this.total.set(term ? filtered.length + offset : total);
    });
  }

  onSearchChange(term: string) { this.searchTerm.set(term.trim()); this.pageIndex.set(0); this.load(); }
  onPageChange(i: number) { this.pageIndex.set(i); this.load(); }

  openView(row: any) { this.viewing = row; this.viewOpen.set(true); }
  closeView() { this.viewOpen.set(false); this.viewing = null; }

  openEdit(row: any) { this.editing = row; this.editOpen.set(true); }
  closeEdit() { this.editOpen.set(false); this.editing = null; }
  saveEdit(val: { email?: string; password?: string }) {
    if (!this.editing?.id) return;
    this.svc.update(this.editing.id, val).subscribe({
      next: () => { this.alerts.success('Usuario actualizado'); this.closeEdit(); this.load(); },
      error: () => this.alerts.error('No se pudo actualizar'),
    });
  }

  onDelete(row: any) { this.deleting = row; this.deleteOpen.set(true); }
  closeDelete() { this.deleteOpen.set(false); this.deleting = null; }
  confirmDelete() {
    if (!this.deleting?.id) return;
    this.svc.remove(this.deleting.id).subscribe({
      next: () => { this.alerts.success('Usuario eliminado'); this.closeDelete(); this.load(); },
      error: () => this.alerts.error('No se pudo eliminar'),
    });
  }

  onPromote(row: any) { this.promoting = row; this.selectedRoleId.set(null); this.promoteOpen.set(true); }
  closePromote() { this.promoteOpen.set(false); this.promoting = null; this.selectedRoleId.set(null); }
  requestPromoteConfirm() { this.confirmPromoteOpen.set(true); }
  closePromoteConfirm() { this.confirmPromoteOpen.set(false); }
  doPromote() {
    const roleId = this.selectedRoleId();
    if (!this.promoting?.id || roleId == null) return;
    this.svc.promoteMedical(this.promoting.id, roleId).subscribe({
      next: () => { this.alerts.success('Usuario promovido a médico'); this.closePromoteConfirm(); this.closePromote(); this.load(); },
      error: () => this.alerts.error('No se pudo promover'),
    });
  }

  onRoleChange(event: Event) {
    const sel = event.target as HTMLSelectElement | null;
    const val = sel && sel.value !== '' ? Number(sel.value) : null;
    this.selectedRoleId.set(Number.isFinite(val as number) ? (val as number) : null);
  }
}
