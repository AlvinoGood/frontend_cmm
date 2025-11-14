import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-template-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './template-create-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateCreateModalComponent {
  private readonly fb = inject(FormBuilder);
  @Input() open = false;
  @Input() modalId = 'modal-template-create';
  @Output() save = new EventEmitter<FormData>();
  @Output() cancel = new EventEmitter<void>();

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    file: [null as File | null, [Validators.required]],
  });

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files && input.files.length ? input.files[0] : null;
    this.form.patchValue({ file });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const fd = new FormData();
    fd.append('name', this.form.value.name as string);
    fd.append('file', this.form.value.file as File);
    this.save.emit(fd);
  }

  onPreClose(ev: Event) { (ev.currentTarget as HTMLElement | null)?.blur(); }
}

