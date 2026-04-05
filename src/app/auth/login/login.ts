import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../core/services/auth'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  credentials = {
    correo: '',
    contrasena: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  iniciarSesion() {
    console.log('Intentando login con:', this.credentials.correo);
    
    this.authService.login(this.credentials).subscribe({
      next: (res: any) => {
        console.log('Login exitoso:', res);
        alert('¡Bienvenido a Yachay-Pro!');
        
        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        this.router.navigate(['/formulario']); 
      },
      error: (err: any) => {
        console.error('Error en el login:', err);
        alert('Correo o contraseña incorrectos. Intenta de nuevo.');
      }
    });
  }
}