import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login'; 
import { RegisterComponent } from './auth/register/register';
import { FormularioComponent } from './pages/formulario/formulario';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './auth/reset-password/reset-password';
import { FaseLecturaComponent } from './pages/simulador/fase-lectura/fase-lectura';
import { FaseAlternativasComponent } from './pages/simulador/fase-alternativas/fase-alternativas';
import { FeedbackComponent } from './pages/simulador/feedback/feedback';
import { authGuard } from './core/guards/auth.guard';
import { DocenteDashboardComponent } from './components/docente-dashboard/docente-dashboard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'formulario', component: FormularioComponent, canActivate: [authGuard] },
  { path: 'simulador/fase/:numero/lectura', component: FaseLecturaComponent, canActivate: [authGuard] },
  { path: 'simulador/fase/:numero/alternativas', component: FaseAlternativasComponent, canActivate: [authGuard] },
  { path: 'simulador/feedback', component: FeedbackComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [roleGuard],
    data: { expectedRole: 'ADMINISTRADOR' }  
  },
  {
path: 'docente', 
    component: DocenteDashboardComponent,
    canActivate: [roleGuard],
    data: { expectedRole: 'DOCENTE' } 
  }
];
