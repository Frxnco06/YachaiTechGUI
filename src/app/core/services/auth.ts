import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegistroRequest, RegistroResponse } from '../models/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly URL = '/api/auth';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.URL}/login`, data).pipe(
      tap(res => {
        localStorage.setItem('yachay_token', res.token);
      })
    );
  }

  registrar(data: RegistroRequest): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(`${this.URL}/register`, data);
  }

  logout(): void {
    localStorage.removeItem('yachay_token');
  }
}