import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent {
  @Input() open = false;
  @Input() title = 'Confirmar';
  @Input() message = '¿Está seguro?';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onCancelClick(ev: Event) {
    const el = ev.currentTarget as HTMLElement | null;
    el?.blur();
    this.cancel.emit();
  }

  onConfirmClick(ev: Event) {
    const el = ev.currentTarget as HTMLElement | null;
    el?.blur();
    this.confirm.emit();
  }
}
