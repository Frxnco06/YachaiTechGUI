import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isSubmitting = false;
  errors: { [key: string]: string | null } = {};
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.forgotForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  solicitarRecuperacion() {
    this.errors = {};
    this.successMessage = null;

    if (this.forgotForm.invalid) {
      if (this.forgotForm.get('correo')?.hasError('required')) {
        this.errors['correo'] = 'El correo institucional es obligatorio';
      } else if (this.forgotForm.get('correo')?.hasError('email')) {
        this.errors['correo'] = 'Formato de correo inválido';
      }
      return;
    }

    this.isSubmitting = true;
    const correo = this.forgotForm.value.correo;

    this.authService.forgotPassword({ correo }).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response; // "Si el correo se encuentra registrado..."
        this.notificationService.success('Solicitud enviada', response);
        this.forgotForm.reset();
      },
      error: (err) => {
        this.isSubmitting = false;
        // Even on error, it's good practice not to reveal if email exists, 
        // but let's show generic error message if server fails.
        let msg = 'Ocurrió un error al procesar la solicitud.';
        if (err.error && typeof err.error === 'string') {
            msg = err.error;
        }
        this.notificationService.error('Error', msg);
      }
    });
  }
}
