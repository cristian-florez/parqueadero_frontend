import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { Usuario } from '../../models/usuario';
import { MensajeService } from '../../services/mensaje.service';
import { UsuarioService } from '../../services/usuario.service';
import { PagoService } from '../../services/pago.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TicketResponse, TicketSalidaRequest } from '../../models/tickets';
import { of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-salida',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './salida.component.html',
  styleUrl: './salida.component.css',
})
export class SalidaComponent implements OnInit {
  formularioBusqueda: FormGroup;
  usuario: Usuario | null = null;
  ticketEncontrado: TicketResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private pagoService: PagoService,
    private usuarioService: UsuarioService,
    private mensajeService: MensajeService
  ) {
    this.formularioBusqueda = this.fb.group({
      codigo: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.usuarioService.usuarioActual$.subscribe((user) => {
      this.usuario = user;
    });
  }

  buscarTicket(): void {
    if (this.formularioBusqueda.invalid) {
      this.mensajeService.error('Por favor, ingrese un código de ticket.');
      return;
    }
    const codigo = this.formularioBusqueda.get('codigo')?.value;

    this.ticketService
      .obtenerPorCodigo(codigo)
      .pipe(
        switchMap((ticket) => {
          if (!ticket) {
            return of(null);
          }
          return this.pagoService
            .calcularTotal(ticket.codigo)
            .pipe(map((total) => ({ ...ticket, totalPagar: total })));
        })
      )
      .subscribe({
        next: (ticketConTotal) => {
          if (ticketConTotal) {
            this.ticketEncontrado = ticketConTotal;
            this.mensajeService.success('Ticket encontrado ✅');
          } else {
            this.ticketEncontrado = null;
            this.mensajeService.error('Ticket no encontrado o ya pagado ❌');
          }
        },
        error: () => {
          this.ticketEncontrado = null;
          this.mensajeService.error('Error al buscar el ticket 🚨');
        },
      });
  }

  registrarSalida(): void {
    if (!this.ticketEncontrado) {
      this.mensajeService.error('No hay un ticket seleccionado.');
      return;
    }

    const ticketSalida: TicketSalidaRequest = {
      codigo: this.ticketEncontrado.codigo,
      idUsuarioLogueado: this.usuario?.id || 0,
    };

    this.ticketService.actualizarSalida(ticketSalida).subscribe({
      next: () => {
        this.mensajeService.success('La salida se registró correctamente ✅');
        this.ticketEncontrado = null;
        this.formularioBusqueda.reset();
      },
      error: () => {
        this.mensajeService.error('Ocurrió un error al registrar la salida');
      },
    });
  }
}