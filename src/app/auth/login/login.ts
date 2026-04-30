import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification.service';
import { LoginSchema } from '../../core/validators/auth.schemas';
import { CommonModule } from '@angular/common';
import { SimuladorService } from '../../core/services/simulador.service';

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
    private simuladorService: SimuladorService,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      correo: [''],
      contrasena: ['']
    });

    this.loginForm.valueChanges.subscribe(() => {
      this.errors = {}; // Limpia errores visuales mientras el usuario escribe
    });
  }

  iniciarSesion() {
    if (this.isSubmitting) return;

    // MEJORA 1: Limpiamos espacios en blanco del correo (evita errores de copiado/pegado)
    const formValues = {
      correo: this.loginForm.value.correo.trim(),
      contrasena: this.loginForm.value.contrasena
    };

    const validationResult = LoginSchema.safeParse(formValues);

    if (!validationResult.success) {
      validationResult.error.issues.forEach(issue => {
        const path = issue.path[0] as string;
        this.errors[path] = issue.message;
      });
      return;
    }

    this.isSubmitting = true;
    this.errors = {}; // Reseteo de errores antes del envío

    this.authService.login(validationResult.data).subscribe({
      next: () => {
        // MEJORA 2: Verificación de roles prioritaria
        const role = this.authService.getUserRole();

        if (role === 'ADMINISTRADOR') {
          this.router.navigate(['/admin']);
        } else if (role === 'DOCENTE') {
          this.router.navigate(['/docente']);
        } else if (role === 'ANALISTA') {
          this.router.navigate(['/formulario']);
        }
        this.simuladorService.obtenerSesionActiva().subscribe({
          next: (sesion) => {
            this.isSubmitting = false;
            this.notificationService.success('¡Bienvenido!', 'Retomando tu sesión actual');

            this.simuladorService.obtenerFaseActual().subscribe(fase => {
              if (fase) {
                this.router.navigate(['/simulador/fase', fase.numero, 'alternativas']);
              } else {
                this.router.navigate(['/formulario']);
              }
            });
          },
          error: () => {
            this.isSubmitting = false;
            this.router.navigate(['/formulario']);
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        console.error('Error en el login:', err);
        this.notificationService.error(
          'Error de autenticación',
          'Credenciales incorrectas. Verifica tu correo institucional y contraseña.'
        );
      }
    });
  }
}