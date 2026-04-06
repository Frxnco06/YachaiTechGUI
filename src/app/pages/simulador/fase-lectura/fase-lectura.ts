import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SimuladorService } from '../../../core/services/simulador.service';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification.service';
import { Fase } from '../../../core/models/simulador.interface';

@Component({
  selector: 'app-fase-lectura',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './fase-lectura.html',
  styleUrls: ['./fase-lectura.css']
})
export class FaseLecturaComponent implements OnInit {
  fase: Fase | null = null;
  numeroFase = 1;
  isLoading = true;

  constructor(
    private simuladorService: SimuladorService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.numeroFase = +params['numero'];
      this.cargarFase();
    });
  }

  private cargarFase(): void {
    this.isLoading = true;
    this.simuladorService.obtenerFase(this.numeroFase).subscribe({
      next: (fase) => {
        console.log('✅ Fase cargada exitosamente:', fase);
        this.fase = fase;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al cargar fase:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
        this.notificationService.error('Error', 'No se pudo cargar el contenido de la fase.');
      }
    });
  }

  iniciarSimulacion(): void {
    this.router.navigate(['/simulador/fase', this.numeroFase, 'alternativas']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
