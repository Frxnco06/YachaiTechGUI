import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SimuladorService } from '../../../core/services/simulador.service';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification.service';
import { Alternativa, DecisionResponse, Sesion } from '../../../core/models/simulador.interface';

/** Represents one card in the selection hub (Phase 1 & 3). */
interface HubGroup {
  id: string;
  title: string;
  description: string;
}

/** Structured feedback after a decision is submitted. */
interface FeedbackState {
  texto: string;
  resultados: string[];
  conclusion: string;
  imagen?: string;
}

@Component({
  selector: 'app-fase-alternativas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './fase-alternativas.html',
  styleUrls: ['./fase-alternativas.css']
})
export class FaseAlternativasComponent implements OnInit {

  // ── State ────────────────────────────────────────────────────────────────
  idFase: number = 1;
  isLoading = true;
  isSubmitting = false;
  bloqueado = false;
  simuladorCompletado = false;
  summaryExpanded = true;
  idSesion: number = 0;

  // ── Data ─────────────────────────────────────────────────────────────────
  alternativas: Alternativa[] = [];
  alternativasFiltradas: Alternativa[] = [];
  alternativasSeleccionadas = new Set<number>();
  sesion: Sesion | null = null;
  siguienteFase: DecisionResponse | null = null;
  currentGroup: string | null = null;
  completedGroups = new Set<string>();
  feedbackActual: FeedbackState | null = null;

  // ── Hub definition (read-only computed) ──────────────────────────────────
  get hubGroups(): HubGroup[] {
    if (this.idFase === 1) {
      return [
        { id: 'A',       title: 'Análisis SENSORIAL',   description: 'Estímulos de compra' },
        { id: 'B',       title: 'Análisis SOCIAL',      description: 'Entorno social' },
        { id: 'C',       title: 'Análisis COGNITIVO',   description: 'Actitudes y Creencias' },
      ];
    }
    if (this.idFase === 3) {
      return [
        { id: 'Axis_PC', title: 'Precio vs. Calidad',           description: 'Eje de Estrategia' },
        { id: 'Axis_ID', title: 'Innovación vs. Diseño',        description: 'Eje de Diferenciación' },
        { id: 'Axis_PE', title: 'Prestigio vs. Experiencia',    description: 'Eje de Valor' },
      ];
    }
    return [];
  }

  /** True when the current phase uses a hub-based selection model. */
  get isHubPhase(): boolean {
    return this.idFase === 1 || this.idFase === 3;
  }

  /** Progress percentage for the sidebar progress bar. */
  get progresoFase(): number {
    const total = this.idFase === 2 ? 2 : 3;
    return (this.completedGroups.size / total) * 100;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  constructor(
    private readonly simuladorService: SimuladorService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idFase = +params['numero'];
      this.inicializar();
    });
  }

  // ── Initialization ────────────────────────────────────────────────────────
  inicializar(): void {
    this.isLoading = true;
    this.resetState();

    this.simuladorService.crearSesion().subscribe({
      next: sesion => {
        this.sesion = sesion;
        this.cargarAlternativas();
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.error('Error', 'No se pudo iniciar la sesión.');
        this.cdr.detectChanges();
      }
    });
  }

  private resetState(): void {
    this.alternativas = [];
    this.alternativasFiltradas = [];
    this.alternativasSeleccionadas.clear();
    this.completedGroups.clear();
    this.currentGroup = null;
    this.feedbackActual = null;
    this.bloqueado = false;
    this.siguienteFase = null;
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private cargarAlternativas(): void {
    this.simuladorService.obtenerAlternativas(this.idFase).subscribe({
      next: alternativas => {
        // Se aplica el shuffle antes de cualquier procesamiento de estado
        this.alternativas = this.shuffle(alternativas);
        this.isLoading = false;

        if (this.isHubPhase) {
          this.currentGroup = null;
          this.recuperarProgreso();
        } else if (this.idFase === 2) {
          this.recuperarProgreso();
        } else {
          // alternativasFiltradas ahora hereda el orden aleatorio
          this.alternativasFiltradas = this.alternativas;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.error('Error', 'No se pudieron cargar las alternativas.');
        this.cdr.detectChanges();
      }
    });
  }

  
  // ── Progress Recovery ─────────────────────────────────────────────────────
private recuperarProgreso(): void {
  // 1. Primero obtenemos el progreso específico para restaurar checks y detectar bloqueo 409
  this.simuladorService.obtenerProgreso(this.idSesion, this.idFase).subscribe({
    next: (progreso) => {
      if (progreso && progreso.idsAlternativas) {
        progreso.idsAlternativas.forEach((id: number) => this.alternativasSeleccionadas.add(id));
      }
      this.consultarHistorialGeneral();
    },
    error: (err) => {
      if (err.status === 409) {
        this.bloqueado = true;
        this.notificationService.warning('Modo Lectura', 'Ya enviaste tus respuestas para esta fase.');
      }
      this.consultarHistorialGeneral();
    }
  });
}

private consultarHistorialGeneral(): void {
  this.simuladorService.obtenerHistorial().subscribe({
    next: historial => {
      if (!historial?.decisiones) {
        this.cdr.detectChanges();
        return;
      }

      historial.decisiones.forEach(decision => {
        const alt = this.alternativas.find(a => a.descAlternativa === decision.descripcionAlternativa);
        if (alt?.grupo) {
          this.completedGroups.add(alt.grupo);
        }
      });

      if (this.isHubPhase && this.completedGroups.size === 3) {
        this.bloquearYCargarSiguienteFase();
        return;
      }

      if (this.idFase === 2) {
        this.manejarProgresoFase2();
      }

      this.cdr.detectChanges();
    },
    error: () => {
      this.cdr.detectChanges();
    }
  });
}


  private manejarProgresoFase2(): void {
    const hijoCompletado = this.completedGroups.has('Hijo');
    const padreCompletado = this.completedGroups.has('Padre');

    if (hijoCompletado && padreCompletado) {
      this.bloquearYCargarSiguienteFase();
    } else if (hijoCompletado) {
      this.seleccionarGrupo('Padre');
    } else {
      this.seleccionarGrupo('Hijo');
    }
  }

  private bloquearYCargarSiguienteFase(): void {
    this.bloqueado = true;
    this.simuladorService.obtenerFaseActual().subscribe(fase => {
      // If fase is null, it means backend knows simulation is fully complete
      if (fase && fase.numero !== this.idFase) {
        this.siguienteFase = fase;
      } else {
        this.simuladorCompletado = true;
        // Auto navigate if refreshing the browser on a fully completed simulation
        if (this.idFase === 3 && !fase) {
           this.router.navigate(['/simulador/feedback']);
        }
      }
      this.cdr.detectChanges();
    });
  }

  private verificarAccesoFase(): void {
  this.simuladorService.obtenerFaseActual().subscribe({
    next: (faseActual) => {
      if (faseActual && faseActual.numero > this.idFase) {
        // El estudiante intenta entrar a una fase que YA superó
        this.bloqueado = true;
        this.notificationService.info('Modo Lectura', 'Esta fase ya ha sido completada y no puede ser modificada.');
      }
    }
  });
}



  // ── Interaction ───────────────────────────────────────────────────────────
  seleccionarGrupo(grupo: string): void {
    if (this.isHubPhase && this.completedGroups.has(grupo)) return;
    this.currentGroup = grupo;
    this.alternativasFiltradas = this.alternativas.filter(a => a.grupo === grupo);
    this.alternativasSeleccionadas.clear();
    this.feedbackActual = null;
    this.cdr.detectChanges();
  }

  toggleAlternativa(alternativa: Alternativa): void {
    if (this.bloqueado || this.isSubmitting || !this.sesion) return;
    // All 3 simulation phases use single-selection
    this.alternativasSeleccionadas.clear();
    this.alternativasSeleccionadas.add(alternativa.idAlternativa);
    this.cdr.detectChanges();
  }

  enviarDecisiones(): void {
    if (this.bloqueado || this.isSubmitting || !this.sesion || this.alternativasSeleccionadas.size === 0) return;
    this.isSubmitting = true;

    this.simuladorService.registrarDecision(this.sesion.idSesion, {
      idsAlternativas: Array.from(this.alternativasSeleccionadas),
      idSesion: this.sesion.idSesion
    }).subscribe({
      next: siguienteFase => {
        this.isSubmitting = false;
        this.manejarRespuestaDecision(siguienteFase);
        this.cdr.detectChanges();
      },
      error: err => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'No se pudo registrar la decisión.';
        this.notificationService.error('Error', msg);
        this.cdr.detectChanges();
      }
    });
  }

  private manejarRespuestaDecision(siguienteFase: DecisionResponse | null): void {
    const seleccionada = this.alternativas.find(a => this.alternativasSeleccionadas.has(a.idAlternativa));
    if (seleccionada && (seleccionada.retroalimentacion?.trim().length ?? 0) > 5) {
      this.parseFeedback(seleccionada);
    }

    if (this.currentGroup) {
      this.completedGroups.add(this.currentGroup);
    }

    const fase1o3Completa = this.isHubPhase && this.completedGroups.size === 3;
    const fase2Completa = this.idFase === 2 && this.completedGroups.has('Hijo') && this.completedGroups.has('Padre');

    if (fase1o3Completa || fase2Completa) {
      if (!siguienteFase?.id) {
         this.simuladorCompletado = true;
         this.notificationService.success('Simulación Finalizada', 'Generando el informe final...');
         this.router.navigate(['/simulador/feedback']);
      } else {
         this.siguienteFase = siguienteFase;
      }
    }
  }

  finalizarReporte(): void {
    const grupoAnterior = this.currentGroup;
    this.feedbackActual = null;
    this.alternativasSeleccionadas.clear();

    if (this.isHubPhase) {
      this.currentGroup = null;
      if (this.completedGroups.size === 3) {
        this.bloqueado = true;
        if (this.siguienteFase) {
          this.notificationService.success('Fase Completada', 'Redirigiendo a la siguiente fase...');
          setTimeout(() => this.navegarSiguienteFase(), 2000);
        } else if (this.simuladorCompletado) {
          this.notificationService.success('Simulación Finalizada', 'Moviendo a resultados...');
          setTimeout(() => this.router.navigate(['/simulador/feedback']), 1500);
        }
      }
    } else if (this.idFase === 2) {
      if (grupoAnterior === 'Hijo') {
        this.seleccionarGrupo('Padre');
      } else if (grupoAnterior === 'Padre') {
        this.currentGroup = null;
        if (this.completedGroups.has('Hijo') && this.completedGroups.has('Padre')) {
          this.bloqueado = true;
          if (this.siguienteFase) {
            this.notificationService.success('Fase Completada', 'Redirigiendo a la siguiente fase...');
            setTimeout(() => this.navegarSiguienteFase(), 2000);
          }
        }
      }
    } else {
      this.bloqueado = true;
    }
    this.cdr.detectChanges();
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  navegarSiguienteFase(): void {
    if (!this.siguienteFase) return;
    this.router.navigate(['/simulador/fase', this.siguienteFase.numero, 'lectura']);
  }

  // ── Feedback Parsing ──────────────────────────────────────────────────────
  private parseFeedback(alt: Alternativa): void {
    const raw = alt.retroalimentacion || '';
    const imgMatch = raw.match(/IMAGEN:([a-zA-Z0-9+_.\-]+)/);
    const imagen = imgMatch?.[1];

    let texto = '';
    let resultados: string[] = [];
    let conclusion = '';

    // Soporte para formato V4: [RESULTADOS] y [CONCLUSION]
    if (raw.includes('[RESULTADOS]') || raw.includes('[CONCLUSION]')) {
      const parts = raw.split(/\[RESULTADOS\]|\[CONCLUSION\]/);
      texto = (parts[0] ?? '').trim();
      
      const resRaw = (parts[1] ?? '').trim();
      if (resRaw) {
        resultados = resRaw.split('- ').filter(r => r.trim().length > 0).map(r => r.trim());
      }
      
      conclusion = (parts[2] ?? '').trim().replace(/IMAGEN:.*/, '').trim();
    } 
    // Soporte para formato V5/V6: ///
    else if (raw.includes('///')) {
      const parts = raw.split('///');
      texto = (parts[0] ?? '').trim();
      if (parts[1] && parts[1].trim() !== '') {
        resultados = parts[1].trim().split('\n').filter(l => l.trim() !== '');
      }
      conclusion = (parts[2] ?? '').trim().replace(/IMAGEN:.*/, '').trim();
    } 
    // Formato plano simple
    else {
      texto = raw.trim().replace(/IMAGEN:.*/, '').trim();
    }

    this.feedbackActual = {
      texto,
      resultados,
      conclusion: conclusion || 'Sin conclusión adicional.',
      imagen
    };
  }
  // ── Auth ──────────────────────────────────────────────────────────────────
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}