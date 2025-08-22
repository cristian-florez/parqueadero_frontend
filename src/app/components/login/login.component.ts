import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../models/usuario';
import { MensajeService } from '../../services/mensaje.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  formularioLogin: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private mensaje: MensajeService,
  ) {
    this.formularioLogin = this.fb.group({
      nombre: ['', Validators.required],
      cedula: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.formularioLogin.valid) {
      const credenciales: Usuario = this.formularioLogin.value;

      this.usuarioService.login(credenciales.nombre, credenciales.cedula).subscribe((isLoggedIn) => {
        if (isLoggedIn) {
          this.router.navigate(['/tabla']);
        } else {
          this.mensaje.error ('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
        }
      });
    }
    }


}
