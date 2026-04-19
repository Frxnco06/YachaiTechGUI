export interface Fase {
  id: number;
  numero: number;
  nombre: string;
  contenido: string;
  alternativas: Alternativa[];
}

export interface Alternativa {
  idAlternativa: number;
  descAlternativa: string;
  puntaje: number;
  retroalimentacion: string;
  orden: number;
  faseSiguienteId: number | null;
  grupo: string | null;
}

export interface Sesion {
  idSesion: number;
  fchInicio: string;
  completado: boolean;
}

export interface DecisionRequest {
  idsAlternativas: number[];
  idSesion: number;
}

export interface DetalleDecision {
  nombreFase: string;
  descripcionAlternativa: string;
  retroalimentacion: string;
  puntajeObtenido: number;
}

export interface HistorialSesion {
  idSesion: number;
  fchInicio: Date;
  completado: boolean;
  puntajeTotal: number;
  decisiones: DetalleDecision[];
}

/**
 * El endpoint POST /api/simulador/sesiones/{id}/decisiones
 * retorna la SIGUIENTE FASE (FaseDtoResponse), no un DTO individual.
 */
export type DecisionResponse = Fase;
