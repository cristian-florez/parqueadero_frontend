import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket';
import { MensajeService } from '../../services/mensaje.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-entrada',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './entrada.component.html',
  styleUrls: ['./entrada.component.css']
})
export class EntradaComponent {

  formularioEntrada: FormGroup;

  constructor(private fb: FormBuilder, private ticketService: TicketService, private mensajeService: MensajeService) {
    this.formularioEntrada = this.fb.group({
      codigoBarrasQR: ['', Validators.required],
      fechaHoraEntrada: ['', Validators.required],
      fechaHoraSalida: [''],
      pagado: [false],
      usuarioRecibio: ['', Validators.required],
      usuarioEntrego: [''],
      vehiculo: this.fb.group({
        placa: ['', Validators.required],
        tipo: ['', Validators.required]
      }),
      pago: [null]
    });
  }

  onSubmit(): void {
    if (this.formularioEntrada.valid) {
      const nuevoTicket: Ticket = this.formularioEntrada.value;

      this.ticketService.createTicket(nuevoTicket).subscribe({
        next: (respuesta) => {

          // ✅ Aviso de éxito
          this.mensajeService.success('El ticket se registró correctamente ✅');

          this.formularioEntrada.reset();
        },
        error: (error) => {

          // ❌ Aviso de error al fallar la API
          this.mensajeService.error('Ocurrió un error al registrar el ticket');
        }
      });
    } else {
      // ❌ Aviso de error si el formulario está incompleto
      this.mensajeService.error('Por favor complete todos los campos obligatorios');
      this.formularioEntrada.markAllAsTouched();
    }
  }

}
