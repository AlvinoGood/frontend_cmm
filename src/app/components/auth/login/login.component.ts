import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertService);

  form = this.fb.nonNullable.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submitting = false;

  submit() {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    const { dni, password } = this.form.getRawValue();
    this.auth.login({ dni, password }).subscribe({
      next: (tokens) => {
        this.auth.setTokens(tokens as any);
        this.alerts.success('Inicio de sesión exitoso');
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.alerts.error('Credenciales inválidas', { autoClose: true });
        this.submitting = false;
      },
      complete: () => {
        this.submitting = false;
      },
    });
  }
}

