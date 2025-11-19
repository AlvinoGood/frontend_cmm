import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private readonly router = inject(Router);

  form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });
  submitting = false;
  errorOpen = false;

  submit() {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    const token = this.route.snapshot.queryParamMap.get('token') || '';
    const { newPassword } = this.form.getRawValue();
    const sub = this.pr.reset(token, newPassword).subscribe({
      next: () => {
        this.router.navigateByUrl('/auth/login');
      },
      error: () => {
        this.alerts.error('No se pudo actualizar la contraseña');
        this.errorOpen = true;
      },
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

