import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification.service';
import { RegisterSchema } from '../../core/validators/auth.schemas';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errors: Record<string, string> = {};
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nombres: [''],
      apepa: [''],
      apema: [''],
      correo: [''],
      contrasena: [''],
      confirmarContrasena: ['']
    });

    this.registerForm.valueChanges.subscribe(() => {
      this.errors = {};
    });
  }

  registrarUsuario() {
    if (this.isSubmitting) return;

    const values = this.registerForm.value;
    const validationResult = RegisterSchema.safeParse(values);

    if (!validationResult.success) {
      validationResult.error.issues.forEach(issue => {
        const path = issue.path[0] as string;
        this.errors[path] = issue.message;
      });
      return;
    }

    this.isSubmitting = true;

    // Remove confirmarContrasena before sending to API
    const { confirmarContrasena, ...apiData } = validationResult.data;

    this.authService.registrar(apiData).subscribe({
      next: (res: any) => {
        this.notificationService.success(
          '¡Registro exitoso!', 
          'Redirigiendo al inicio de sesión en unos segundos...'
        );
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        console.error('Error:', err);
        this.notificationService.error(
          'Error al registrar',
          'Ha ocurrido un error durante el registro. Verifica tus datos o intenta nuevamente.'
        );
      }
    });
  }
}