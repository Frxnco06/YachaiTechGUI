import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html', 
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent {
  usuarios = [
    { email: 'sandy.dev@cibertec.pe', rol: 'DOCENTE' },
    { email: 'gabriel.sm@cibertec.pe', rol: 'ADMINISTRADOR' },
    { email: 'franco.fe@cibertec.pe', rol: 'ANALISTA' }
  ];

  getRoleClass(rol: string): string {
    switch (rol) {
      case 'ADMINISTRADOR': return 'bg-rose-100 text-rose-700';
      case 'DOCENTE': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}