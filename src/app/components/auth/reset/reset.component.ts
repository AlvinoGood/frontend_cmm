import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PasswordRecoveryService } from '../services/password-recovery.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset.component.html',
  styleUrl: './reset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetComponent {
  private readonly fb = inject(FormBuilder);
  private readonly pr = inject(PasswordRecoveryService);
  private readonly alerts = inject(AlertService);
  private readonly route = inject(ActivatedRoute);

  form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });
  submitting = false;

  submit() {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    const token = this.route.snapshot.queryParamMap.get('token') || '';
    const { newPassword } = this.form.getRawValue();
    this.pr.reset(token, newPassword).subscribe({
      next: () => this.alerts.success('Contraseña actualizada'),
      error: () => this.alerts.error('No se pudo actualizar'),
      complete: () => (this.submitting = false),
    });
  }
}

