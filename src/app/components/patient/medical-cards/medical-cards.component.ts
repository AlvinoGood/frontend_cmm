import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MedicalCardsService } from '../../../core/services/medical-cards.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-patient-medical-cards',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medical-cards.component.html',
  styleUrl: './medical-cards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientMedicalCardsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(MedicalCardsService);
  private readonly alerts = inject(AlertService);

  topOpen = signal(false);
  loading = signal(true);
  rows = signal<any[]>([]);
  selected = signal<any | null>(null);
  minCareDate = '';

  form = this.fb.nonNullable.group({
    age: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    maritalStatus: ['', [Validators.required]],
    levelEducation: ['', [Validators.required]],
    workPlace: ['', [Validators.required]],
    area: ['', [Validators.required]],
    bloodGroup: ['', [Validators.required]],
    clinicalHistory: ['', [Validators.required]],
    careDate: ['', [Validators.required, minTodayValidator()]],
    expirationDate: ['', [Validators.required]],
    resultStool: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.reload();

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    this.minCareDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    this.form.get('careDate')?.valueChanges.subscribe((v) => {
      if (!v) return;
      const exp = this.addOneYear(v);
      this.form.get('expirationDate')?.setValue(exp, { emitEvent: false });
    });
  }

  private reload() {
    this.loading.set(true);
    this.svc.listMine().subscribe(({ items }) => {
      const normalized = (items ?? []).map((it: any) => ({
        id: it.id ?? it.medical_card_id,
        careDate: it.careDate ?? it.care_date,
        expirationDate: it.expirationDate ?? it.expiration_date,
        status: it.status ?? '-',
        ownerDni: it.owner?.dni ?? it.user?.dni ?? '-',
        ownerEmail: it.owner?.email ?? it.user?.email ?? '-',
        age: it.age ?? it.Age ?? '-',
        maritalStatus: it.maritalStatus ?? it.marital_status ?? '-',
        levelEducation: it.levelEducation ?? it.level_education ?? '-',
        workPlace: it.workPlace ?? it.work_place ?? '-',
        area: it.area ?? '-',
        bloodGroup: it.bloodGroup ?? it.blood_group ?? '-',
        clinicalHistory: it.clinicalHistory ?? it.clinical_history ?? '-',
        resultStool: it.resultStool ?? it.result_stool ?? '-',
      }));
      this.rows.set(normalized);
      this.loading.set(false);
    });
  }

  openCreate() { this.topOpen.set(true); }
  closeCreate() { this.topOpen.set(false); this.form.reset({ age: 0, maritalStatus: '', levelEducation: '', workPlace: '', area: '', bloodGroup: '', clinicalHistory: '', careDate: '', expirationDate: '', resultStool: '' }); }
  openView(row: any) { this.selected.set(row); }
  closeView() { this.selected.set(null); }

  isPaid(status: any): boolean {
    const t = String(status ?? '').toLowerCase();
    return t === 'paid' || t === 'approved';
  }
  isPending(status: any): boolean {
    const t = String(status ?? '').toLowerCase();
    return t === 'pending' || t === 'peding';
  }
  statusLabel(status: any): string {
    const t = String(status ?? '').toLowerCase();
    if (t === 'paid' || t === 'approved') return 'Aprobado';
    if (t === 'pending' || t === 'peding') return 'Pendiente';
    if (t === 'expired') return 'Vencido';
    return status || '-';
  }
  onSubmit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.svc.create(v).subscribe({
      next: () => { this.alerts.success('Solicitud registrada'); this.closeCreate(); this.reload(); },
      error: () => this.alerts.error('No se pudo registrar'),
    });
  }

  private addOneYear(input: string): string {
    const d = new Date(input);
    if (isNaN(d.getTime())) return input;
    d.setFullYear(d.getFullYear() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  }
}


function minTodayValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const raw = control.value as string;
    if (!raw) return null; 
    const d = new Date(raw);
    if (isNaN(d.getTime())) return { minDate: true };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime() ? { minDate: true } : null;
  };
}
