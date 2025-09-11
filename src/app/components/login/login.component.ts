import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { UsuarioLogin } from '../../models/usuario';
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
  mensajeError: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private mensajeService: MensajeService
  ) {
    this.formularioLogin = this.fb.group({
      nombre: ['', Validators.required],
      cedula: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.formularioLogin.valid) {
      const credenciales: UsuarioLogin = this.formularioLogin.value;

      this.usuarioService.login(credenciales).subscribe({
        next: (usuario) => {
          if (usuario) {
            this.router.navigate(['/tabla']);
          }
        },
        error: (err) => {
          if (err.status === 409) {
            this.mensajeError = 'Ya existe un turno activo.';
          } else {
            this.mensajeError =
              'Credenciales incorrectas. Por favor, inténtelo de nuevo.';
          }
        },
      });
    }
  }
}
