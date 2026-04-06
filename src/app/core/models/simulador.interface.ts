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
}

export interface DecisionRequest {
  idsAlternativas: number[];
}

export interface DecisionResponse {
  idPuntaje: number;
  retroalimentacion: string;
}
