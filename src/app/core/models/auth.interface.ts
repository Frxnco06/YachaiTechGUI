export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  nombres: string;
  rol: string;
}

export interface RegistroRequest {
  correo: string;
  contrasena: string;
  nombres: string;
  apepa: string; 
  apema: string; 
}

export interface RegistroResponse {
  id: number;
  correo: string;
  nombres: string;
  rol: string;
}