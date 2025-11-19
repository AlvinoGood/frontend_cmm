import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PasswordRecoveryService } from '../services/password-recovery.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotComponent {
  private readonly fb = inject(FormBuilder);
  private readonly pr = inject(PasswordRecoveryService);
  private readonly alerts = inject(AlertService);
  private readonly router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  submitting = false;
  errorOpen = false;

  submit() {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    const { email } = this.form.getRawValue();
    const sub = this.pr.request(email).subscribe({
      next: () => this.alerts.info('Revisa tu correo para recuperar tu contraseña'),
      error: () => { this.alerts.error('No se pudo procesar la solicitud'); this.errorOpen = true; },
      complete: () => (this.submitting = false),
    });
    sub.add(() => {
      if (!this.errorOpen) this.router.navigateByUrl('/auth/login');
    });
  }

  onErrorClose() {
    this.errorOpen = false;
    this.router.navigateByUrl('/auth/login');
  }
}
