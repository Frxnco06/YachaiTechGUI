import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data';
import { Alumno } from '../../core/models/alumno.interface';

@Component({
  selector: 'app-docente-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './docente-dashboard.html',
  styleUrls: ['./docente-dashboard.css']
})
export class DocenteDashboardComponent implements OnInit {
  private dataService = inject(DataService);
  
  alumnos: Alumno[] = [];
  isLoading: boolean = true;

  ngOnInit(): void {
    this.dataService.getResultados().subscribe({
      next: (data) => {
        this.alumnos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar alumnos', err);
        this.isLoading = false;
      }
    });
  }

  // Genera la inicial para el avatar circular del estilo YachayPro[cite: 1]
  getInitial(nombre: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }
}