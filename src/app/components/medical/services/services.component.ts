import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, DataTableHeader } from '../../../shared/components/ui/data-table/data-table.component';
import { ServicesService } from '../../../core/services/services.service';

@Component({
  selector: 'app-medical-services',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicalServicesComponent implements OnInit {
  private readonly svc = inject(ServicesService);

  headers: DataTableHeader[] = [
    { label: 'Nombre', key: 'name' },
    { label: 'Codigo', key: 'code' },
    { label: 'Precio', key: 'price' },
    { label: 'Especialidad', key: 'specialty' },
  ];

  rows = signal<any[]>([]);
  pageSize = 10;
  pageIndex = signal(0);
  searchTerm = signal('');
  total = signal(0);

  // Solo vista de detalle (lectura)
  viewOpen = signal(false);
  viewing: any | null = null;

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
      const normalized = (items ?? []).map((it: any) => ({
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

  // Handlers headless de tabla
  onSearchChange(term: string) {
    this.searchTerm.set(term.trim());
    this.pageIndex.set(0);
    this.load();
  }

  onPageChange(idx: number) {
    this.pageIndex.set(idx);
    this.load();
  }

  // Solo ver detalle
  openView(row: any) { this.viewing = row; this.viewOpen.set(true); }
  closeView() { this.viewOpen.set(false); this.viewing = null; }
}

