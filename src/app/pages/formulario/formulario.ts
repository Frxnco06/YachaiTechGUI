import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { SimuladorService } from '../../core/services/simulador.service';

import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class FormularioComponent implements OnInit {
  isNavigating = false;

  constructor(
    private authService: AuthService,
    private simuladorService: SimuladorService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Auth guard handles session validation
  }

  /**
   * Navega al simulador detectando automáticamente el progreso del usuario.
   * 1. Crea o recupera la sesión activa.
   * 2. Consulta al backend cuál es la fase actual pendiente.
   * 3. Navega directamente a esa fase.
   */
  iniciarSimulador(): void {
    if (this.isNavigating) return;
    this.isNavigating = true;

    this.simuladorService.crearSesion().subscribe({
      next: () => {
        // Sesión asegurada, consultar la fase actual pendiente
        this.simuladorService.obtenerFaseActual().subscribe({
          next: (fase) => {
            this.isNavigating = false;
            
            if (fase && fase.id) {
              // Navega directamente a la fase en la que se quedó
              this.router.navigate(['/simulador/fase', fase.id, 'lectura']);
            } else {
              // Si retorna null, significa que ya completó todas las fases
              this.router.navigate(['/simulador/feedback']);
            }
          },
          error: () => {
            this.isNavigating = false;
            this.notificationService.error('Error', 'No se pudo obtener el progreso del simulador.');
          }
        });
      },
      error: () => {
        this.isNavigating = false;
        this.notificationService.error('Error', 'No se pudo iniciar la sesión del simulador.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
