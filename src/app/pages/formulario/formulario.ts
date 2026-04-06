import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class FormularioComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Auth guard handles session validation
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
