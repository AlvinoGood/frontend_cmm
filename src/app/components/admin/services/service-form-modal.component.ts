import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { MedicalRolesService } from '../../../core/services/medical-roles.service';

export interface ServiceFormValue {
  id?: number;
  name: string;
  code?: string;
  price: number;
  specialty?: string;
  medicalRoleId?: number;
}

@Component({
  selector: 'app-service-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-form-modal.component.html',
  styleUrl: './service-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceFormModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly rolesSvc = inject(MedicalRolesService);
  @Input() open = false;
  @Input() title = 'Servicio';
  @Input() modalId = 'modal-service-form';
  @Input() value: ServiceFormValue | null = null;
  @Output() save = new EventEmitter<ServiceFormValue>();
  @Output() cancel = new EventEmitter<void>();

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    code: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    specialty: [''],
    medicalRoleId: [undefined as number | undefined],
  });

  roles = signal<any[]>([]);

  ngOnChanges() {
    if (this.value) {
      this.form.patchValue({
        name: this.value.name ?? '',
        code: this.value.code ?? '',
        price: this.value.price ?? 0,
        specialty: this.value.specialty ?? '',
        medicalRoleId: this.value.medicalRoleId,
      });
    } else {
      this.form.reset({ name: '', code: '', price: 0, specialty: '', medicalRoleId: undefined });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const payload: ServiceFormValue = { ...(this.value ?? {}), ...this.form.getRawValue() };
    this.save.emit(payload);
  }

  onPreClose(ev: Event) {
    const el = ev.currentTarget as HTMLElement | null;
    el?.blur();
  }

  ngOnInit(): void {
    this.rolesSvc.list(20, 0).subscribe({
      next: (items) => this.roles.set(items),
      error: () => this.roles.set([]),
    });
  }
}
