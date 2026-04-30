import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { SimuladorService } from '../../core/services/simulador.service';

import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule],
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
  }


  iniciarSimulador(): void {
    if (this.isNavigating) return;
    this.isNavigating = true;

    this.simuladorService.crearSesion().subscribe({
      next: () => {
        this.simuladorService.obtenerFaseActual().subscribe({
          next: (fase) => {
            this.isNavigating = false;
            
            if (fase && fase.id) {
              this.router.navigate(['/simulador/fase', fase.id, 'lectura']);
            } else {
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
