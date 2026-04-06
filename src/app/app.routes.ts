import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login'; 
import { RegisterComponent } from './auth/register/register';
import { FormularioComponent } from './pages/formulario/formulario';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './auth/reset-password/reset-password';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'formulario', component: FormularioComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];