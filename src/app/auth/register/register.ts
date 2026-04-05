import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  nuevoUsuario = {
    nombres: '',
    apepa: '',
    apema: '',
    correo: '',
    contrasena: ''
  };

  constructor(private authService: AuthService) { }

  registrarUsuario() {
    console.log('Enviando datos:', this.nuevoUsuario);
this.authService.registrar(this.nuevoUsuario).subscribe({
  next: (res: any) => { 
    console.log('Éxito:', res);
    alert('¡Registro exitoso!');
  },
  error: (err: any) => { 
    console.error('Error:', err);
  }
});  }
}