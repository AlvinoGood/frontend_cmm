import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, DataTableHeader } from '../../../shared/components/ui/data-table/data-table.component';
import { ServicesService } from '../../../core/services/services.service';
import { ServiceFormModalComponent, ServiceFormValue } from './components/service-form-modal/service-form-modal.component';
import { ServiceCreateModalComponent, ServiceCreateValue } from './components/service-create-modal/service-create-modal.component';
import { AlertService } from '../../../core/services/alert.service';
import { ConfirmModalComponent } from '../../../shared/components/ui/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ServiceFormModalComponent, ServiceCreateModalComponent, ConfirmModalComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminServicesComponent implements OnInit {
  private readonly svc = inject(ServicesService);

  headers: DataTableHeader[] = [
    { label: 'Nombre', key: 'name' },
    { label: 'Codigo', key: 'code' },
    { label: 'Precio', key: 'price' },
    { label: 'Especialidad', key: 'specialty' },
  ];

  rows = signal<any[]>([]);
  // Estado de tabla headless
  pageSize = 10;
  pageIndex = signal(0);
  searchTerm = signal('');
  total = signal(0);
  createOpen = signal(false);
  editOpen = signal(false);
  editing: any | null = null;
  deleteOpen = signal(false);
  deleting: any | null = null;
  @ViewChild('editTrigger', { static: true }) editTrigger!: ElementRef<HTMLButtonElement>;
  @ViewChild('deleteTrigger', { static: true }) deleteTrigger!: ElementRef<HTMLButtonElement>;
  @ViewChild('viewTrigger', { static: true }) viewTrigger!: ElementRef<HTMLButtonElement>;
  viewOpen = signal(false);
  viewing: any | null = null;
  private readonly alerts = inject(AlertService);

  ngOnInit(): void {
    this.load();
  }

  private serviceBatchSize = 100;

  private load(): void {
    const uiIndex = this.pageIndex();
    const pageSize = this.pageSize;
    const batch = this.serviceBatchSize;
    const absoluteOffset = uiIndex * pageSize;
    const batchIndex = Math.floor(absoluteOffset / batch);
    const serviceOffset = batchIndex * batch;
    const sliceStart = absoluteOffset - serviceOffset;

    this.svc.list(batch, serviceOffset).subscribe(({ items, total }) => {
      const normalized = items.map((it: any) => ({
        id: it.id ?? it.service_id ?? it.code,
        name: it.name ?? it.service_name,
        code: it.code ?? it.service_code,
        price: typeof it.price === 'string' ? it.price : (it.price ?? 0),
        specialty: it.specialty ?? it.medical_role ?? it.medicalRole?.specialtyName ?? it.medicalRole?.name ?? '',
      }));
      const term = this.searchTerm().toLowerCase();
      const filtered = term
        ? normalized.filter((r) =>
            String(r.name).toLowerCase().includes(term) ||
            String(r.code).toLowerCase().includes(term) ||
            String(r.specialty).toLowerCase().includes(term)
          )
        : normalized;
      const pageRows = filtered.slice(sliceStart, sliceStart + pageSize);
      this.rows.set(pageRows);
      this.total.set(term ? filtered.length + serviceOffset : total);
    });
  }

  // Handlers headless
  onSearchChange(term: string) {
    this.searchTerm.set(term.trim());
    this.pageIndex.set(0);
    this.load();
  }

  onPageChange(idx: number) {
    this.pageIndex.set(idx);
    this.load();
  }

  openCreate() {
    this.createOpen.set(true);
  }
  closeCreate() {
    this.createOpen.set(false);
  }
  saveCreate(val: ServiceFormValue) {
    this.svc.create({
      name: val.name,
      code: val.code,
      price: val.price,
      medicalRoleId: val.medicalRoleId,
    }).subscribe({
      next: () => {
        this.alerts.success('Servicio creado');
        this.closeCreate();
        this.load();
      },
      error: () => this.alerts.error('No se pudo crear'),
    });
  }

  openEdit(row: any) {
    this.editing = row;
    this.editOpen.set(true);
    queueMicrotask(() => this.editTrigger?.nativeElement.click());
  }
  closeEdit() { this.editOpen.set(false); this.editing = null; }
  saveEdit(val: ServiceFormValue) {
    if (!this.editing?.id) return;
    this.svc.update(this.editing.id, {
      name: val.name,
      code: val.code,
      price: val.price,
      medicalRoleId: val.medicalRoleId,
    }).subscribe({
      next: () => {
        this.alerts.success('Servicio actualizado');
        this.closeEdit();
        this.load();
      },
      error: () => this.alerts.error('No se pudo actualizar'),
    });
  }

  onView(row: any) {}
  onEdit(row: any) { this.openEdit(row); }
  onDelete(row: any) { this.deleting = row; this.deleteOpen.set(true); queueMicrotask(() => this.deleteTrigger?.nativeElement.click()); }

  openView(row: any) {
    this.viewing = row;
    this.viewOpen.set(true);
    queueMicrotask(() => this.viewTrigger?.nativeElement.click());
  }
  closeView() { this.viewOpen.set(false); this.viewing = null; }
  closeDelete() { this.deleteOpen.set(false); this.deleting = null; }
  confirmDelete() {
    if (!this.deleting?.id) return;
    this.svc.remove(this.deleting.id).subscribe({
      next: () => {
        this.alerts.success('Servicio eliminado');
        this.closeDelete();
        this.load();
      },
      error: () => this.alerts.error('No se pudo eliminar'),
    });
  }
}

