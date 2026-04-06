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
  resultado: DecisionResponse | null = null;
  numeroFase = 1;
  isLoading = true;
  isSubmitting = false;
  alternativasSeleccionadas: Set<number> = new Set<number>();
  bloqueado = false;

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
      this.numeroFase = +params['numero'];
      this.inicializar();
    });
  }

  private inicializar(): void {
    this.isLoading = true;

    // First, ensure we have an active session
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
    this.simuladorService.obtenerAlternativas(this.numeroFase).subscribe({
      next: (alternativas) => {
        console.log('✅ Alternativas cargadas:', alternativas);
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
      idsAlternativas: Array.from(this.alternativasSeleccionadas)
    }).subscribe({
      next: (resultado) => {
        console.log('✅ Decisiones registradas:', resultado);
        this.resultado = resultado;
        this.bloqueado = true;
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al registrar decisiones:', err);
        this.isSubmitting = false;
        this.alternativasSeleccionadas.clear();
        this.cdr.detectChanges();

        let msg = 'No se pudo registrar la decisión.';
        if (err.status === 409) {
          msg = 'Ya has tomado decisiones para esta fase.';
          this.bloqueado = true;
          this.cdr.detectChanges();
        } else if (err.error?.message) {
          msg = err.error.message;
        }
        this.notificationService.error('Error', msg);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
