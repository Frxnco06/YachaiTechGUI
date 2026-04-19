import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SimuladorService } from '../../../core/services/simulador.service';
import { HistorialSesion } from '../../../core/models/simulador.interface';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './feedback.html',
  styleUrl: './feedback.css'
})
export class FeedbackComponent implements OnInit {
  historial: HistorialSesion | null = null;
  isLoading = true;

  constructor(
    private simuladorService: SimuladorService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.simuladorService.obtenerHistorial().subscribe({
      next: (data) => {
        if (!data) {
          console.warn('⚠️ No hay historial disponible (data null/vacía)');
          this.router.navigate(['/formulario']);
          return;
        }
        console.log('✅ Historial cargado:', data);
        this.historial = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error cargando historial:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}

