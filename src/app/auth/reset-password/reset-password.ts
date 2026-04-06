import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isSubmitting = false;
  errors: { [key: string]: string | null } = {};
  successMessage: string | null = null;
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      nuevaContrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasena: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.notificationService.error('Error', 'Token de recuperación no encontrado o inválido.');
        this.router.navigate(['/login']);
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('nuevaContrasena');
    const confirmPassword = control.get('confirmarContrasena');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      // Set the error on the specific control rather than the group if preferred,
      // but we return the error for the group here.
      return { 'passwordMismatch': true };
    }
    return null;
  }

  restablecerContrasena() {
    this.errors = {};
    this.successMessage = null;

    if (this.resetForm.invalid) {
      if (this.resetForm.get('nuevaContrasena')?.hasError('required')) {
        this.errors['nuevaContrasena'] = 'La contraseña es obligatoria';
      } else if (this.resetForm.get('nuevaContrasena')?.hasError('minlength')) {
        this.errors['nuevaContrasena'] = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (this.resetForm.get('confirmarContrasena')?.hasError('required')) {
        this.errors['confirmarContrasena'] = 'Debe confirmar su contraseña';
      }

      if (this.resetForm.hasError('passwordMismatch')) {
        this.errors['confirmarContrasena'] = 'Las contraseñas no coinciden';
      }
      return;
    }

    if (!this.token) {
      this.notificationService.error('Error', 'Token de recuperación inválido.');
      return;
    }

    this.isSubmitting = true;
    const nuevaContrasena = this.resetForm.value.nuevaContrasena;

    this.authService.resetPassword({ token: this.token, nuevaContrasena }).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response; // "Contraseña restablecida exitosamente."
        this.notificationService.success('Éxito', response);
        this.resetForm.reset();
      },
      error: (err) => {
        this.isSubmitting = false;
        let msg = 'Ocurrió un error al procesar la solicitud.';
        if (err.error && typeof err.error === 'string') {
            msg = err.error;
        }
        this.notificationService.error('Error', msg);
      }
    });
  }
}
