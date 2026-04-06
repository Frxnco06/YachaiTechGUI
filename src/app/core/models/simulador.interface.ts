export interface Fase {
  id: number;
  numero: number;
  nombre: string;
  contenido: string;
}

export interface Alternativa {
  idAlternativa: number;
  descAlternativa: string;
  puntaje: number;
  retroalimentacion: string;
  orden: number;
}

export interface Sesion {
  idSesion: number;
  fchInicio: string;
  completado: boolean;
  puntajeTotal: number;
}

export interface DecisionRequest {
  idAlternativa: number;
}

export interface DecisionResponse {
  idPuntaje: number;
  puntajeObtenido: number;
  puntajeTotal: number;
  retroalimentacion: string;
}
