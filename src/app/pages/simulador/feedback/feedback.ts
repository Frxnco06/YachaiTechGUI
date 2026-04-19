import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SimuladorService } from '../../../core/services/simulador.service';
import { HistorialSesion } from '../../../core/models/simulador.interface';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Escenario {
  titulo: string;
  rango: string;
  color: string;
  icono: string;
  respuesta: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './feedback.html',
  styleUrl: './feedback.css'
})
export class FeedbackComponent implements OnInit {

  @ViewChild('chatEnd') chatEnd!: ElementRef;

  // ── State ──────────────────────────────────────────────────────────────────
  historial: HistorialSesion | null = null;
  isLoading = true;
  mensajeUsuario = '';
  chatMessages: ChatMessage[] = [];
  isTyping = false;

  // ── Scenarios ──────────────────────────────────────────────────────────────
  readonly escenarios: Escenario[] = [
    {
      titulo: 'Escenario Muy Positivo',
      rango: '18–20 puntos',
      color: 'emerald',
      icono: 'emoji_events',
      respuesta: 'Tu desempeño ha sido sobresaliente. Has demostrado un análisis profundo y estratégico en la identificación del Buyer Persona y en la formulación de propuestas de posicionamiento. Yachay Tech confirma su decisión de continuar trabajando contigo como consultor, confiando en que tus aportes serán clave para impulsar las ventas de la tablet Kallpa.'
    },
    {
      titulo: 'Escenario Positivo',
      rango: '15–17 puntos',
      color: 'blue',
      icono: 'thumb_up',
      respuesta: 'Excelente trabajo. Has reflejado un buen nivel de análisis y propuestas sólidas para el posicionamiento de la tablet Kallpa. Aunque aún hay aspectos que pueden perfeccionarse, Yachay Tech ha decidido continuar con tu asesoría como consultor, valorando tu aporte en la construcción de estrategias de mercado.'
    },
    {
      titulo: 'Escenario Regular',
      rango: '11–14 puntos',
      color: 'amber',
      icono: 'trending_flat',
      respuesta: 'Hemos observado que tu análisis es correcto en algunos aspectos, pero aún presenta limitaciones. Yachay Tech considera que tu trabajo es valioso como ejercicio formativo, pero en este momento no continuará con tu asesoría como consultor. Te animamos a seguir perfeccionando tus habilidades.'
    },
    {
      titulo: 'Escenario Básico',
      rango: 'Hasta 10 puntos',
      color: 'red',
      icono: 'trending_down',
      respuesta: 'Las decisiones tomadas no lograron generar un análisis claro ni propuestas estratégicas consistentes. Por ello, Yachay Tech ha decidido no continuar con tu asesoría como consultor. Sin embargo, valoramos tu participación y te invitamos a seguir practicando para fortalecer tu capacidad de análisis y toma de decisiones.'
    }
  ];

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  constructor(
    private readonly simuladorService: SimuladorService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  cargarHistorial(): void {
    this.simuladorService.obtenerHistorial().subscribe({
      next: data => {
        if (!data) {
          this.router.navigate(['/formulario']);
          return;
        }
        this.historial = data;
        this.isLoading = false;
        this.iniciarChatContextual();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Scenario logic ─────────────────────────────────────────────────────────
  get escenarioActual(): Escenario {
    const pts = this.historial?.puntajeTotal ?? 0;
    if (pts >= 18) return this.escenarios[0];
    if (pts >= 15) return this.escenarios[1];
    if (pts >= 11) return this.escenarios[2];
    return this.escenarios[3];
  }

  // ── Chat ───────────────────────────────────────────────────────────────────
  private iniciarChatContextual(): void {
    const escenario = this.escenarioActual;
    const saludo = `¡Hola! Soy tu coach de marketing. Acabo de revisar tu informe: obtuviste **${this.historial?.puntajeTotal} puntos** — *${escenario.titulo}*.\n\n¿Tienes alguna duda sobre tus decisiones o quieres reflexionar sobre alguna estrategia en particular?`;
    this.chatMessages.push({ role: 'assistant', content: saludo });
  }

  enviarMensaje(): void {
    const texto = this.mensajeUsuario.trim();
    if (!texto || this.isTyping) return;

    this.chatMessages.push({ role: 'user', content: texto });
    this.mensajeUsuario = '';
    this.isTyping = true;
    this.scrollToBottom();

    const contexto = this.buildContexto();

    this.simuladorService.chatConIA(texto, contexto).subscribe({
      next: res => {
        this.chatMessages.push({ role: 'assistant', content: res.respuesta });
        this.isTyping = false;
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: () => {
        this.chatMessages.push({ role: 'assistant', content: 'Lo siento, no pude conectarme con el asistente en este momento. Intenta de nuevo.' });
        this.isTyping = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildContexto(): string {
    if (!this.historial) return '';
    const decisiones = this.historial.decisiones.map(d =>
      `- Fase: ${d.nombreFase} | Decisión: ${d.descripcionAlternativa} | Puntos: ${d.puntajeObtenido}`
    ).join('\n');
    return `Puntaje total: ${this.historial.puntajeTotal}\nEscenario: ${this.escenarioActual.titulo}\nDecisiones tomadas:\n${decisiones}`;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.chatEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
}
