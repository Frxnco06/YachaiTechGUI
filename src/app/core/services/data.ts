import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Alumno } from '../models/alumno.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  
  // URL base apuntando al backend de Sandy[cite: 1]
  private readonly API_URL = 'http://localhost:8080/api'; 

  // Obtiene los resultados para el Dashboard de Docente[cite: 1]
  getResultados(): Observable<Alumno[]> {
    return this.http.get<Alumno[]>(`${this.API_URL}/resultados`);
  }

  // Obtiene la lista de usuarios para el Dashboard de Administrador[cite: 1]
  getUsuariosAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/admin/usuarios`);
  }
}