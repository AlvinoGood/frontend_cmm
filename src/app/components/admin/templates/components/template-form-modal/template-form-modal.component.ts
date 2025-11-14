import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

export interface TemplateFormValue {
  id?: number;
  name?: string;
}

@Component({
  selector: 'app-template-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './template-form-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateFormModalComponent {
  private readonly fb = inject(FormBuilder);
  @Input() open = false;
  @Input() modalId = 'modal-template-edit';
  @Input() value: { id?: number; name?: string } | null = null;
  @Output() save = new EventEmitter<FormData>();
  @Output() cancel = new EventEmitter<void>();

  form = this.fb.nonNullable.group({ name: [''] });
  file: File | null = null;

  ngOnChanges() {
    this.form.patchValue({ name: this.value?.name ?? '' });
    this.file = null;
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement | null;
    this.file = input?.files && input.files.length ? input.files[0] : null;
  }

  onSubmit() {
    const fd = new FormData();
    const name = this.form.value.name?.trim();
    if (name) fd.append('name', name);
    if (this.file) fd.append('file', this.file);
    this.save.emit(fd);
  }

  onPreClose(ev: Event) { (ev.currentTarget as HTMLElement | null)?.blur(); }
}

