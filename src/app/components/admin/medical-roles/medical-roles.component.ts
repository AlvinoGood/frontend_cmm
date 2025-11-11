import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, DataTableHeader } from '../../../shared/components/ui/data-table/data-table.component';
import { ConfirmModalComponent } from '../../../shared/components/ui/confirm-modal/confirm-modal.component';
import { MedicalRolesService } from '../../../core/services/medical-roles.service';
import { MedicalRoleFormModalComponent, MedicalRoleFormValue } from './components/medical-role-form-modal/medical-role-form-modal.component';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-admin-medical-roles',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ConfirmModalComponent, MedicalRoleFormModalComponent],
  templateUrl: './medical-roles.component.html',
  styleUrl: './medical-roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMedicalRolesComponent implements OnInit {
  private readonly svc = inject(MedicalRolesService);
  private readonly alerts = inject(AlertService);

  headers: DataTableHeader[] = [
    { label: 'Especialidad', key: 'specialtyName' },
    { label: 'Plantilla', key: 'templateName' },
  ];

  rows = signal<any[]>([]);
  pageSize = 10;
  pageIndex = signal(0);
  searchTerm = signal('');
  total = signal(0);

  // Modals
  createOpen = signal(false);
  editOpen = signal(false);
  deleteOpen = signal(false);
  viewingOpen = signal(false);

  editing: any | null = null;
  deleting: any | null = null;
  viewing: any | null = null;


  ngOnInit(): void {
    this.load();
  }

  private batchSize = 100;
  private load(): void {
    const uiIndex = this.pageIndex();
    const pageSize = this.pageSize;
    const batch = this.batchSize;
    const absoluteOffset = uiIndex * pageSize;
    const batchIndex = Math.floor(absoluteOffset / batch);
    const serviceOffset = batchIndex * batch;
    const sliceStart = absoluteOffset - serviceOffset;

    this.svc.listPage(batch, serviceOffset).subscribe(({ items, total }) => {
      const normalized = items.map((it: any) => ({
        id: it.id ?? it.medical_role_id,
        specialtyName: it.specialtyName ?? it.specialty_name ?? it.name,
        templateName: it.template?.name ?? it.templateName ?? '',
        templateId: it.template?.id ?? it.templateId ?? null,
      }));
      const term = this.searchTerm().toLowerCase();
      const filtered = term
        ? normalized.filter((r) =>
            String(r.specialtyName).toLowerCase().includes(term) ||
            String(r.templateName).toLowerCase().includes(term)
          )
        : normalized;
      const pageRows = filtered.slice(sliceStart, sliceStart + pageSize);
      this.rows.set(pageRows);
      this.total.set(term ? filtered.length + serviceOffset : total);
    });
  }

  onSearchChange(term: string) { this.searchTerm.set(term.trim()); this.pageIndex.set(0); this.load(); }
  onPageChange(i: number) { this.pageIndex.set(i); this.load(); }

  // Create
  openCreate() { this.createOpen.set(true); }
  closeCreate() { this.createOpen.set(false); }
  saveCreate(val: MedicalRoleFormValue) {
    this.svc.create({ specialtyName: val.specialtyName, templateId: val.templateId ?? undefined }).subscribe({
      next: () => { this.alerts.success('Rol creado'); this.closeCreate(); this.load(); },
      error: () => this.alerts.error('No se pudo crear'),
    });
  }

  // Edit
  openEdit(row: any) { this.editing = row; this.editOpen.set(true); }
  closeEdit() { this.editOpen.set(false); this.editing = null; }
  saveEdit(val: MedicalRoleFormValue) {
    if (!this.editing?.id) return;
    this.svc.update(this.editing.id, { specialtyName: val.specialtyName, templateId: val.templateId ?? null }).subscribe({
      next: () => { this.alerts.success('Rol actualizado'); this.closeEdit(); this.load(); },
      error: () => this.alerts.error('No se pudo actualizar'),
    });
  }

  // Delete
  onDelete(row: any) { this.deleting = row; this.deleteOpen.set(true); }
  closeDelete() { this.deleteOpen.set(false); this.deleting = null; }
  confirmDelete() {
    if (!this.deleting?.id) return;
    this.svc.remove(this.deleting.id).subscribe({
      next: () => { this.alerts.success('Rol eliminado'); this.closeDelete(); this.load(); },
      error: () => this.alerts.error('No se pudo eliminar'),
    });
  }

  // View
  openView(row: any) { this.viewing = row; this.viewingOpen.set(true); }
  closeView() { this.viewingOpen.set(false); this.viewing = null; }
}
