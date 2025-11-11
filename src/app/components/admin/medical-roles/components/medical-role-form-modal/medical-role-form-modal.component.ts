import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicalTemplatesService } from '../../../../../core/services/medical-templates.service';

export interface MedicalRoleFormValue {
  id?: number;
  specialtyName: string;
  templateId?: number | null;
}

@Component({
  selector: 'app-medical-role-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medical-role-form-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicalRoleFormModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly templatesSvc = inject(MedicalTemplatesService);

  @Input() open = false;
  @Input() title = 'Rol médico';
  @Input() modalId = 'modal-role-form';
  @Input() value: MedicalRoleFormValue | null = null;
  @Output() save = new EventEmitter<MedicalRoleFormValue>();
  @Output() cancel = new EventEmitter<void>();

  form = this.fb.nonNullable.group({
    specialtyName: ['', [Validators.required]],
    templateId: [null as number | null],
  });

  templates = signal<any[]>([]);

  ngOnInit(): void {
    this.templatesSvc.list().subscribe({
      next: (items) => this.templates.set(items ?? []),
      error: () => this.templates.set([]),
    });
  }

  ngOnChanges() {
    if (this.value) {
      this.form.patchValue({
        specialtyName: this.value.specialtyName ?? '',
        templateId: this.value.templateId ?? null,
      });
    } else {
      this.form.reset({ specialtyName: '', templateId: null });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const payload: MedicalRoleFormValue = { ...(this.value ?? {}), ...this.form.getRawValue() };
    this.save.emit(payload);
  }

  onPreClose(ev: Event) { (ev.currentTarget as HTMLElement | null)?.blur(); }
}
