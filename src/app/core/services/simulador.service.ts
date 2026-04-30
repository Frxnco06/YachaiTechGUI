import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fase, Alternativa, Sesion, DecisionRequest, DecisionResponse, HistorialSesion } from '../models/simulador.interface';

@Injectable({ providedIn: 'root' })
export class SimuladorService {
  private readonly FASES_URL = '/api/fases';
  private readonly SIMULADOR_URL = '/api/simulador';

  
  constructor(private http: HttpClient) {}

  obtenerProgreso(idSesion: number, idFase: number): Observable<any> {
  return this.http.get<any>(`${this.SIMULADOR_URL}/sesiones/${idSesion}/fases/${idFase}/progreso`);
  }
  obtenerFase(idFase: number): Observable<Fase> {
    return this.http.get<Fase>(`${this.FASES_URL}/${idFase}`);
  }

  obtenerAlternativas(idFase: number): Observable<Alternativa[]> {
    return this.http.get<Alternativa[]>(`${this.FASES_URL}/${idFase}/alternativas`);
  }

  crearSesion(): Observable<Sesion> {
    return this.http.post<Sesion>(`${this.SIMULADOR_URL}/sesiones`, {});
  }

  obtenerSesionActiva(): Observable<Sesion> {
    return this.http.get<Sesion>(`${this.SIMULADOR_URL}/sesiones/activa`);
  }

 
  registrarDecision(sesionId: number, request: DecisionRequest): Observable<DecisionResponse> {
    return this.http.post<DecisionResponse>(
      `${this.SIMULADOR_URL}/sesiones/${sesionId}/decisiones`,
      request
    );
  }

  obtenerFaseActual(): Observable<Fase | null> {
    return this.http.get<Fase | null>(`${this.SIMULADOR_URL}/fase-actual`);
  }

  obtenerHistorial(): Observable<HistorialSesion> {
    return this.http.get<HistorialSesion>(`${this.SIMULADOR_URL}/historial`);
  }

  chatConIA(mensajeUsuario: string, contextoInforme: string): Observable<{ respuesta: string }> {
    return this.http.post<{ respuesta: string }>(`${this.SIMULADOR_URL}/chat`, {
      mensajeUsuario,
      contextoInforme
    });
  }
}
