import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, DataTableHeader } from '../../../shared/components/ui/data-table/data-table.component';
import { ConfirmModalComponent } from '../../../shared/components/ui/confirm-modal/confirm-modal.component';
import { MedicalTemplatesService } from '../../../core/services/medical-templates.service';
import { AlertService } from '../../../core/services/alert.service';
import { TemplateCreateModalComponent } from './components/template-create-modal/template-create-modal.component';
import { TemplateFormModalComponent } from './components/template-form-modal/template-form-modal.component';
import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';
@Component({
  selector: 'app-admin-templates',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ConfirmModalComponent, TemplateCreateModalComponent, TemplateFormModalComponent, PdfViewerComponent
  ],
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTemplatesComponent implements OnInit {
  private readonly svc = inject(MedicalTemplatesService);
  private readonly alerts = inject(AlertService);

  headers: DataTableHeader[] = [
    { label: 'Nombre', key: 'name' },
    { label: 'Archivo', key: 'originalFileName' },
  ];

  rows = signal<any[]>([]);
  total = signal(0);
  pageIndex = signal(0);
  pageSize = 10;
  searchTerm = signal('');

  createOpen = signal(false);
  editOpen = signal(false);
  deleteOpen = signal(false);

  editing: any | null = null;
  deleting: any | null = null;
  viewing: any | null = null;

  ngOnInit(): void {
    this.load();
  }

  private allItems: any[] = [];

  private load(): void {
    this.svc.list().subscribe((items) => {
      const normalized = (items ?? []).map((t: any) => ({
        id: t.id ?? t.medical_template_id,
        name: t.name ?? t.name_template,
        originalFileName: t.originalFileName ?? t.original_file_name ?? '',
        filePath: t.filePath ?? t.file_path ?? '',
      }));
      this.allItems = normalized;
      this.applyFilterPage();
      this.total.set(normalized.length);
    });
  }

  private applyFilterPage() {
    const term = this.searchTerm().toLowerCase();
    const filtered = term
      ? this.allItems.filter((r) =>
        String(r.name).toLowerCase().includes(term) ||
        String(r.originalFileName).toLowerCase().includes(term)
      )
      : this.allItems;
    const start = this.pageIndex() * this.pageSize;
    this.rows.set(filtered.slice(start, start + this.pageSize));
    this.total.set(filtered.length);
  }

  onSearchChange(term: string) { this.searchTerm.set(term.trim()); this.pageIndex.set(0); this.applyFilterPage(); }
  onPageChange(i: number) { this.pageIndex.set(i); this.applyFilterPage(); }

  openCreate() { this.createOpen.set(true); }
  closeCreate() { this.createOpen.set(false); }

  saveCreate(form: FormData) {
    this.svc.create(form).subscribe({
      next: () => { this.alerts.success('Plantilla creada'); this.closeCreate(); this.load(); },
      error: () => this.alerts.error('No se pudo crear'),
    });
  }

  openEdit(row: any) { this.editing = row; this.editOpen.set(true); }
  closeEdit() { this.editOpen.set(false); this.editing = null; }
  saveEdit(form: FormData) {
    if (!this.editing?.id) return;
    this.svc.update(this.editing.id, form).subscribe({
      next: () => { this.alerts.success('Plantilla actualizada'); this.closeEdit(); this.load(); },
      error: () => this.alerts.error('No se pudo actualizar'),
    });
  }

  onDelete(row: any) { this.deleting = row; this.deleteOpen.set(true); }
  closeDelete() { this.deleteOpen.set(false); this.deleting = null; }
  confirmDelete() {
    if (!this.deleting?.id) return;
    this.svc.remove(this.deleting.id).subscribe({
      next: () => { this.alerts.success('Plantilla eliminada'); this.closeDelete(); this.load(); },
      error: () => this.alerts.error('No se pudo eliminar'),
    });
  }

  openView(row: any) {
    this.viewing = row;

    if (!row?.id) {
      this.alerts.error('Plantilla inválida');
      return;
    }


  }
}
