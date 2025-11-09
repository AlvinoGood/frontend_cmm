import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertService);

  form = this.fb.nonNullable.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/),
      ],
    ],
  });

  submitting = false;
  showPwdHelp = false;
  showPassword = false;

  get dniCtrl() {
    return this.form.controls.dni;
  }
  get emailCtrl() {
    return this.form.controls.email;
  }
  get passwordCtrl() {
    return this.form.controls.password;
  }

  private passwordValue = toSignal(
    this.form.controls.password.valueChanges.pipe(startWith(this.form.controls.password.value ?? '')),
    { initialValue: this.form.controls.password.value ?? '' }
  );

  hasUpper = computed(() => /[A-Z]/.test(this.passwordValue() ?? ''));
  hasNumber = computed(() => /\d/.test(this.passwordValue() ?? ''));
  hasSpecial = computed(() => /[^A-Za-z0-9]/.test(this.passwordValue() ?? ''));
  hasMin = computed(() => (this.passwordValue()?.length ?? 0) >= 8);

  submit() {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    const { dni, email, password } = this.form.getRawValue();
    this.auth.register({ dni, email, password }).subscribe({
      next: (tokens) => {
        this.auth.setTokens(tokens as any);
        this.alerts.success('Cuenta creada');
        this.router.navigateByUrl('/app');
      },
      error: () => {
        this.alerts.error('No se pudo registrar');
        this.submitting = false;
      },
      complete: () => (this.submitting = false),
    });
  }
}
