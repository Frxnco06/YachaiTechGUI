import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fase, Alternativa, Sesion, DecisionRequest, DecisionResponse } from '../models/simulador.interface';

@Injectable({ providedIn: 'root' })
export class SimuladorService {
  private readonly FASES_URL = '/api/fases';
  private readonly SIMULADOR_URL = '/api/simulador';

  constructor(private http: HttpClient) {}

  obtenerFase(numero: number): Observable<Fase> {
    return this.http.get<Fase>(`${this.FASES_URL}/${numero}`);
  }

  obtenerAlternativas(numero: number): Observable<Alternativa[]> {
    return this.http.get<Alternativa[]>(`${this.FASES_URL}/${numero}/alternativas`);
  }

  crearSesion(): Observable<Sesion> {
    return this.http.post<Sesion>(`${this.SIMULADOR_URL}/sesiones`, {});
  }

  obtenerSesionActiva(): Observable<Sesion> {
    return this.http.get<Sesion>(`${this.SIMULADOR_URL}/sesiones/activa`);
  }

  registrarDecision(sesionId: number, data: DecisionRequest): Observable<DecisionResponse> {
    return this.http.post<DecisionResponse>(
      `${this.SIMULADOR_URL}/sesiones/${sesionId}/decisiones`,
      data
    );
  }
}
