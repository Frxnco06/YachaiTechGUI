import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegistroRequest, RegistroResponse, ForgotPasswordRequest, ResetPasswordRequest } from '../models/auth.interface';

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

getUserRole(): string | null {
  const token = localStorage.getItem('yachay_token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.rol || null; 
  } catch (e) {
    return null;
  }
}

registrar(data: RegistroRequest): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(`${this.URL}/register`, data);
  }

  logout(): void {
    localStorage.removeItem('yachay_token');
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<string> {
    return this.http.post(`${this.URL}/forgot-password`, data, { responseType: 'text' });
  }

  resetPassword(data: ResetPasswordRequest): Observable<string> {
    return this.http.post(`${this.URL}/reset-password`, data, { responseType: 'text' });
  }
}