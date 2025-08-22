import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket';
import { MensajeService } from '../../services/mensaje.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-salida',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './salida.component.html',
  styleUrl: './salida.component.css',
})
export class SalidaComponent {
  formularioSalida: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private mensajeService: MensajeService
  ) {
    this.formularioSalida = this.fb.group({
      codigoBarrasQR: ['', Validators.required],
      fechaHoraSalida: ['', Validators.required],
      usuarioEntrego: ['', Validators.required],
      vehiculo: this.fb.group({
        placa: ['', Validators.required],
      }),
    });
  }

  onSubmit(): void {
    if (this.formularioSalida.valid) {
      const nuevoTicket: Ticket = this.formularioSalida.value;

      this.ticketService.updateTicket(nuevoTicket.codigoBarrasQR ,nuevoTicket).subscribe({
        next: (respuesta) => {
          console.log('Ticket creado con éxito', respuesta);

          // ✅ Aviso de éxito
          this.mensajeService.success('La salida se registro correctamente ✅');

          this.formularioSalida.reset();
        },
        error: (error) => {

          // ❌ Aviso de error al fallar la API
          this.mensajeService.error('Ocurrió un error al registrar la salida');
        },
      });
    } else {
      // ❌ Aviso de error si el formulario está incompleto
      this.mensajeService.error(
        'Por favor complete todos los campos obligatorios'
      );
      this.formularioSalida.markAllAsTouched();
    }
  }
}
