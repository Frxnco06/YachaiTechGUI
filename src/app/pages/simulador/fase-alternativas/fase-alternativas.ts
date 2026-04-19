import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SimuladorService } from '../../../core/services/simulador.service';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification.service';
import { Alternativa, DecisionResponse, Sesion } from '../../../core/models/simulador.interface';

@Component({
  selector: 'app-fase-alternativas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './fase-alternativas.html',
  styleUrls: ['./fase-alternativas.css']
})
export class FaseAlternativasComponent implements OnInit {
  alternativas: Alternativa[] = [];
  sesion: Sesion | null = null;
  siguienteFase: DecisionResponse | null = null;
  idFase = 1;
  isLoading = true;
  isSubmitting = false;
  alternativasSeleccionadas: Set<number> = new Set<number>();
  bloqueado = false;
  simuladorCompletado = false;

  constructor(
    private simuladorService: SimuladorService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idFase = +params['numero'];
      this.inicializar();
    });
  }

  private inicializar(): void {
    this.isLoading = true;

    this.simuladorService.crearSesion().subscribe({
      next: (sesion) => {
        console.log('✅ Sesión iniciada:', sesion);
        this.sesion = sesion;
        this.cargarAlternativas();
      },
      error: (err) => {
        console.error('❌ Error al iniciar sesión:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
        this.notificationService.error('Error', 'No se pudo iniciar la sesión del simulador.');
      }
    });
  }

  private cargarAlternativas(): void {
    this.simuladorService.obtenerAlternativas(this.idFase).subscribe({
      next: (alternativas) => {
        console.log('✅ Alternativas cargadas (antes de barajar):', alternativas);
        
        // Shuffle the alternatives using Fisher-Yates
        for (let i = alternativas.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [alternativas[i], alternativas[j]] = [alternativas[j], alternativas[i]];
        }
        
        this.alternativas = alternativas;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al cargar alternativas:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
        this.notificationService.error('Error', 'No se pudieron cargar las alternativas.');
      }
    });
  }

  toggleAlternativa(alternativa: Alternativa): void {
    if (this.bloqueado || this.isSubmitting || !this.sesion) return;

    if (this.alternativasSeleccionadas.has(alternativa.idAlternativa)) {
      this.alternativasSeleccionadas.delete(alternativa.idAlternativa);
    } else {
      this.alternativasSeleccionadas.add(alternativa.idAlternativa);
    }
    this.cdr.detectChanges();
  }

  enviarDecisiones(): void {
    if (this.bloqueado || this.isSubmitting || !this.sesion || this.alternativasSeleccionadas.size === 0) return;

    this.isSubmitting = true;

    this.simuladorService.registrarDecision(this.sesion.idSesion, {
      idsAlternativas: Array.from(this.alternativasSeleccionadas),
      idSesion: this.sesion.idSesion
    }).subscribe({
      next: (siguienteFase) => {
        console.log('✅ Decisiones registradas. Siguiente fase:', siguienteFase);
        this.bloqueado = true;
        this.isSubmitting = false;

        if (siguienteFase && siguienteFase.id) {
          // Hay siguiente fase disponible
          this.siguienteFase = siguienteFase;
        } else {
          // Última fase — simulador completado, navegar al feedback
          this.router.navigate(['/simulador/feedback']);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al registrar decisiones:', err);
        this.isSubmitting = false;
        this.alternativasSeleccionadas.clear();
        this.cdr.detectChanges();

        if (err.status === 409) {
          // Ya se registró una decisión para esta fase → avanzar automáticamente
          this.avanzarAFaseSiguiente();
        } else {
          const msg = err.error?.message || 'No se pudo registrar la decisión.';
          this.notificationService.error('Error', msg);
        }
      }
    });
  }

  /**
   * Cuando la fase actual ya fue completada (409), determina la siguiente fase
   * usando el faseSiguienteId de las alternativas cargadas y navega automáticamente.
   */
  private avanzarAFaseSiguiente(): void {
    const siguienteId = this.alternativas.find(a => a.faseSiguienteId != null)?.faseSiguienteId;

    if (siguienteId) {
      this.notificationService.info(
        'Fase ya completada',
        'Ya tomaste decisiones en esta fase. Avanzando a la siguiente...'
      );
      setTimeout(() => {
        this.router.navigate(['/simulador/fase', siguienteId, 'lectura']);
      }, 1500);
    } else {
      // Es la última fase — no hay siguiente
      this.bloqueado = true;
      this.cdr.detectChanges();
      this.notificationService.success(
        '¡Simulador completado!',
        'Has completado todas las fases del simulador.'
      );
    }
  }

  navegarSiguienteFase(): void {
    if (!this.siguienteFase) return;
    this.router.navigate(['/simulador/fase', this.siguienteFase.id, 'lectura']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
