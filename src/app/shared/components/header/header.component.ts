import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Usuario } from '../../../models/usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  currentUser$: Observable<Usuario | null>;

  constructor(private usuarioService: UsuarioService, private router: Router) {
    this.currentUser$ = this.usuarioService.currentUser$;
  }

  logout(): void {
    this.usuarioService.logout();
    this.router.navigate(['/login']);
  }
}
