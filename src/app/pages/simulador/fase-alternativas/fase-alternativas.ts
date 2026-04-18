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
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.numeroFase = +params['numero'] || 1;
      this.inicializar();
    });
  }

  private inicializar(): void {
    this.isLoading = true;
    this.simuladorService.crearSesion().subscribe({
      next: (sesion) => {
        this.sesion = sesion;
        this.cargarAlternativas();
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error('Error', 'No se pudo iniciar la sesión.');
        this.cdr.detectChanges();
      }
    });
  }

  private cargarAlternativas(): void {
    this.isLoading = true;
    this.simuladorService.obtenerAlternativas(this.numeroFase).subscribe({
      next: (alternativas) => {
        this.alternativas = alternativas;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error('Error', 'No se pudieron cargar las alternativas.');
        this.cdr.detectChanges();
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
  toggleAlternativaStatic(id: number): void {
    if (this.bloqueado || this.isSubmitting) return;

    if (this.alternativasSeleccionadas.has(id)) {
      this.alternativasSeleccionadas.delete(id);
    } else {
      this.alternativasSeleccionadas.add(id);
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
        this.resultado = resultado;
        this.bloqueado = true;
        this.isSubmitting = false;

        this.notificationService.success('¡Decisión Registrada!', 'Revisa el feedback del consultor antes de continuar.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        let msg = 'No se pudo registrar la decisión.';

        if (err.status === 409) {
          msg = 'Ya has tomado decisiones para esta fase.';
          this.bloqueado = true;
        }

        this.notificationService.error('Error', msg);
        this.cdr.detectChanges();
      }
    });
  }

  irASiguienteFase(): void {
    this.numeroFase++;

    this.alternativasSeleccionadas.clear();
    this.resultado = null;
    this.bloqueado = false;

    this.cargarAlternativas();

    this.router.navigate(['/simulador/fase', this.numeroFase, 'seleccion'], { replaceUrl: true });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}