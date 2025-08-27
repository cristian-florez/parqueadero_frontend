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
import { Ticket } from '../../models/ticket';
import { Usuario } from '../../models/usuario';
import { MensajeService } from '../../services/mensaje.service';
import { UsuarioService } from '../../services/usuario.service';
import { PagoService } from '../../services/pago.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-salida',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './salida.component.html',
  styleUrl: './salida.component.css',
})
export class SalidaComponent implements OnInit {
  formularioSalida: FormGroup;
  private desactivarBusqueda = false;
  usuario: Usuario | null = null;
  ticket: Ticket | null = null;

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private mensajeService: MensajeService,
    private usuarioService: UsuarioService,
    private pagoService: PagoService
  ) {
    this.formularioSalida = this.fb.group({
      codigoBarrasQR: ['', Validators.required],
      fechaHoraEntrada: ['', Validators.required],
      usuarioRecibio: ['', Validators.required],
      vehiculo: this.fb.group({
        placa: ['', Validators.required],
        tipo: ['', Validators.required],
      }),
    });

    // 🔎 Escuchar cuando cambia el código QR
    this.formularioSalida
      .get('codigoBarrasQR')
      ?.valueChanges.pipe(
        debounceTime(400), // espera mientras el usuario escribe
        distinctUntilChanged(), // evita búsquedas repetidas
        switchMap((codigo: string) => {
          if (this.desactivarBusqueda || !codigo) {
            return []; // no hacer nada si está vacío o si pausamos
          }
          return this.ticketService.getTicketByCodigo(codigo);
        })
      )
      .subscribe({
        next: (ticket: Ticket | null) => {
          if (ticket) {
            this.ticket = ticket;

            // ✅ Llamar al servicio de pago y asignarlo
            this.pagoService.obtenerPago(ticket.codigoBarrasQR).subscribe({
              next: (pago) => {
                if (this.ticket) {
                  this.ticket.pago = pago;
                }
              },
              error: () => {
                this.mensajeService.error('No se pudo calcular el pago ❌');
              },
            });

            // ✅ Llenar el formulario con los datos encontrados
            this.formularioSalida.patchValue({
              usuarioRecibio: ticket.usuarioRecibio,
              fechaHoraEntrada: this.ticket.fechaHoraEntrada,
              vehiculo: {
                tipo: ticket.vehiculo.tipo,
                placa: ticket.vehiculo.placa,
              },
              // 👀 puedes agregar más campos si tu modelo Ticket tiene más
            });

            this.mensajeService.success('Ticket encontrado ✅');
          } else {
            // ❌ Ticket no encontrado → limpiar campos dependientes
            this.ticket = null;

            this.formularioSalida.patchValue({
              usuarioEntrego: '',
              vehiculo: { placa: '' },
            });

            this.mensajeService.error('Ticket no encontrado o ya pagado❌');
          }
        },
        error: () => {
          this.mensajeService.error('Error al buscar el ticket 🚨');
        },
      });
  }


  ngOnInit(): void {
    this.usuarioService.usuarioActual$.subscribe((user) => {
      this.usuario = user;
    });
  }

  onSubmit(): void {
    if (this.formularioSalida.valid) {
      const nuevoTicket: Ticket = this.formularioSalida.value;
      nuevoTicket.usuarioEntrego = this.usuario?.nombre || '';

      this.ticketService
        .updateTicket(nuevoTicket.codigoBarrasQR, nuevoTicket)
        .subscribe({
          next: (respuesta) => {
            console.log('Ticket actualizado con éxito', respuesta);
            this.mensajeService.success(
              'La salida se registró correctamente ✅'
            );

            // 🔴 Pausar la búsqueda para que no dispare "no encontrado"
            this.desactivarBusqueda = true;
            this.ticket = null;
            this.formularioSalida.reset();

            // Reactivar la búsqueda luego de un pequeño delay
            setTimeout(() => {
              this.desactivarBusqueda = false;
            }, 500);
          },
          error: () => {
            this.mensajeService.error(
              'Ocurrió un error al registrar la salida'
            );
          },
        });
    } else {
      this.mensajeService.error(
        'Por favor complete todos los campos obligatorios'
      );
      this.formularioSalida.markAllAsTouched();
    }
  }

  // 🔎 Método de búsqueda manual
  buscarTicketManual(): void {
    const codigo = this.formularioSalida.get('codigoBarrasQR')?.value;

    if (!codigo) {
      this.mensajeService.error('Ingrese un código de barras primero');
      return;
    }

    this.ticketService.getTicketByCodigo(codigo).subscribe({
      next: (ticket: Ticket | null) => {
        if (ticket) {
          this.formularioSalida.patchValue({
            usuarioEntrego: ticket.usuarioEntrego,
            vehiculo: {
              placa: ticket.vehiculo.placa,
            },
          });

          this.mensajeService.success('Ticket encontrado ✅');
        } else {
          this.ticket = null;

          this.formularioSalida.patchValue({
            usuarioEntrego: '',
            vehiculo: { placa: '' },
          });

          this.mensajeService.error('Ticket no encontrado ❌');
        }
      },
      error: () => {
        this.mensajeService.error('Error al buscar el ticket 🚨');
      },
    });
  }
}
