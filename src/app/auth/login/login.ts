import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification.service';
import { LoginSchema } from '../../core/validators/auth.schemas';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errors: Record<string, string> = {};
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      correo: [''],
      contrasena: ['']
    });

    // Clear errors on input change
    this.loginForm.valueChanges.subscribe(() => {
      this.errors = {};
    });
  }

  iniciarSesion() {
    if (this.isSubmitting) return;

    const values = this.loginForm.value;
    const validationResult = LoginSchema.safeParse(values);

    if (!validationResult.success) {
      // Map Zod errors
      validationResult.error.issues.forEach(issue => {
        const path = issue.path[0] as string;
        this.errors[path] = issue.message;
      });
      return;
    }

    this.isSubmitting = true;
    
    this.authService.login(validationResult.data).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.notificationService.success('¡Bienvenido a Yachay-Pro!', 'Sesión iniciada correctamente');
        this.router.navigate(['/formulario']);
        // Note: Token storage is already handled safely by AuthService
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        console.error('Error en el login:', err);
        this.notificationService.error('Error de autenticación', 'Correo o contraseña incorrectos. Intenta de nuevo.');
      }
    });
  }
}