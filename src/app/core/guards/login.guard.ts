import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(private usuarioService: UsuarioService, private router: Router) {}

  canActivate(): boolean {
    if (this.usuarioService.estaLogueado()) {
      // Si ya está logueado, redirige a "tabla"
      this.router.navigate(['/tabla']);
      return false;
    }
    return true; // Si no está logueado, permite ir a /login
  }
}
