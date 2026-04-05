import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login'; 
import { RegisterComponent } from './auth/register/register';
import { FormularioComponent } from './pages/formulario/formulario';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'formulario', component: FormularioComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];