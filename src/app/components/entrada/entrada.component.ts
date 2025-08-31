import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { UsuarioService } from '../../services/usuario.service';
import { QzService } from '../../services/qz.service';
import { TarifaService } from '../../services/tarifa.service';
import { Ticket } from '../../models/ticket';
import { Usuario } from '../../models/usuario';
import { MensajeService } from '../../services/mensaje.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { format } from 'date-fns';


@Component({
  selector: 'app-entrada',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './entrada.component.html',
  styleUrls: ['./entrada.component.css'],
})
export class EntradaComponent implements OnInit {
  formularioEntrada: FormGroup;
  formularioReimpresion: FormGroup;
  formularioMensualidad: FormGroup; // New form group for monthly entries

  usuario: Usuario | null = null;

  tarifas: { [key: string]: number } = {};

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private mensajeService: MensajeService,
    private usuarioService: UsuarioService,
    private tarifaService: TarifaService,
    private qzService: QzService
  ) {
    this.formularioEntrada = this.fb.group({
      vehiculo: this.fb.group({
        placa: ['', Validators.required],
        tipo: ['', Validators.required],
      }),
      pago: [null],
    });

    this.formularioReimpresion = this.fb.group({
      codigo: ['', Validators.required],
    });

    // Initialize new form group for monthly entries
    this.formularioMensualidad = this.fb.group({
      vehiculo: this.fb.group({
        placa: ['', Validators.required],
        tipo: ['', Validators.required],
      }),
      fechaHoraEntrada: ['', Validators.required],
      dias: [1, [Validators.required, Validators.min(1)]],
      precio: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.usuarioService.usuarioActual$.subscribe((user) => {
      this.usuario = user;
    });

    // Traer todas las tarifas al iniciar
    this.tarifaService.getTarifas().subscribe((data) => {
      data.forEach((t) => (this.tarifas[t.tipoVehiculo] = t.precioDia));
    });

    // 🔹 Suscripción para convertir la placa a mayúsculas automáticamente para formularioEntrada
    const placaControlEntrada = this.formularioEntrada.get('vehiculo.placa');
    placaControlEntrada?.valueChanges.subscribe((valor: string) => {
      if (valor && valor !== valor.toUpperCase()) {
        placaControlEntrada.setValue(valor.toUpperCase(), { emitEvent: false });
      }
    });

    // 🔹 Suscripción para convertir la placa a mayúsculas automáticamente para formularioMensualidad
    const placaControlMensualidad = this.formularioMensualidad.get('vehiculo.placa');
    placaControlMensualidad?.valueChanges.subscribe((valor: string) => {
      if (valor && valor !== valor.toUpperCase()) {
        placaControlMensualidad.setValue(valor.toUpperCase(), { emitEvent: false });
      }
    });

    // 🔹 Suscripción para calcular fechaHoraSalida en formularioMensualidad
    this.formularioMensualidad.valueChanges.subscribe(values => {
      const fechaEntrada = values.fechaHoraEntrada;
      const dias = values.dias;
      if (fechaEntrada && dias) {
        const entradaDate = new Date(fechaEntrada);
        const salidaDate = new Date(entradaDate);
        salidaDate.setDate(entradaDate.getDate() + dias);
        // No need to store fechaHoraSalida in the form, calculate it on submit
      }
    });
  }

  onSubmit(): void {
    if (this.formularioEntrada.valid) {
      const nuevoTicket: any = this.formularioEntrada.value;
      nuevoTicket.usuarioRecibio = this.usuario?.nombre || '';
      nuevoTicket.fechaHoraEntrada = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");

      this.ticketService.createTicket(nuevoTicket).subscribe({
        next: async (respuesta) => {
          // ✅ Aviso de éxito
          this.mensajeService.success('El ticket se registró correctamente ✅');

          // 🔹 Generar ESC/POS para impresión
          const texto = this.generarEscPos(respuesta);

          // 🔹 Mandar a QZ Tray
          try {
            await this.qzService.imprimirTexto('ticket', texto);
          } catch (err) {
            this.mensajeService.error('No se pudo imprimir el ticket');
            console.error(err);
          }

          this.formularioEntrada.reset();
        },
        error: (error) => {
          // ❌ Aviso de error al fallar la API
          this.mensajeService.error('Ocurrió un error al registrar el ticket');
        },
      });
    } else {
      // ❌ Aviso de error si el formulario está incompleto
      this.mensajeService.error(
        'Por favor complete todos los campos obligatorios'
      );
      this.formularioEntrada.markAllAsTouched();
    }
  }

  // New method for monthly entry submission
  onSubmitMensualidad(): void {
    if (this.formularioMensualidad.valid) {
      const nuevoTicketMensualidad: Ticket = {
        codigoBarrasQR: '', // Backend will generate this
        fechaHoraEntrada: new Date(this.formularioMensualidad.get('fechaHoraEntrada')?.value),
        fechaHoraSalida: new Date(new Date(this.formularioMensualidad.get('fechaHoraEntrada')?.value).setDate(new Date(this.formularioMensualidad.get('fechaHoraEntrada')?.value).getDate() + this.formularioMensualidad.get('dias')?.value)),
        pagado: true,
        usuarioRecibio: this.usuario?.nombre || '',
        usuarioEntrego: this.usuario?.nombre || '',
        vehiculo: {
          placa: this.formularioMensualidad.get('vehiculo.placa')?.value + '-MENSUALIDAD',
          tipo: this.formularioMensualidad.get('vehiculo.tipo')?.value,
        },
        pago: {
          total: this.formularioMensualidad.get('precio')?.value,
          fechaHora: new Date(),
        },
      };

      this.ticketService.createTicket(nuevoTicketMensualidad).subscribe({
        next: async (respuesta) => {
          this.mensajeService.success('El ticket de mensualidad se registró correctamente ✅');
          // Optionally print a ticket for monthly entry, similar to regular entry
          const texto = this.generarEscPos(respuesta);
          try {
            await this.qzService.imprimirTexto('ticket', texto);
          } catch (err) {
            this.mensajeService.error('No se pudo imprimir el ticket de mensualidad');
            console.error(err);
          }
          this.formularioMensualidad.reset();
        },
        error: (error) => {
          this.mensajeService.error('Ocurrió un error al registrar el ticket de mensualidad');
          console.error(error);
        },
      });
    } else {
      this.mensajeService.error(
        'Por favor complete todos los campos obligatorios para la mensualidad'
      );
      this.formularioMensualidad.markAllAsTouched();
    }
  }

  // Método que recibe un string y lo retorna en mayúsculas
  convertirAMayusculas(campo: string) {
    const control = this.formularioEntrada.get(campo);
    if (control && control.value) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }

  private generarEscPos(ticket: Ticket): string {
    const codigo = ticket.codigoBarrasQR || '0000000000'; // fallback por si no viene vacío
    return (
      '\x1B\x40' + // Inicializar
      '\x1B\x61\x01' + // Centrar
      'ESTACION DE SERVICIO EL SAMAN\n' +
      'Calle 5 cra 15 esquina Alcala-Valle\n' +
      'cel 3217023382\n' + 
      '------------------------\n' + 
      '\x1B\x61\x00' + // Alinear izquierda
      'Placa: ' +
      (ticket.vehiculo?.placa || '') +
      '\n' +
      'Tipo: ' +
      (ticket.vehiculo?.tipo || '') +
      '\n' +
      'Entrada: ' +
      new Date(ticket.fechaHoraEntrada).toLocaleString() +
      '\n' +
      'Atendido por: ' +
      (ticket.usuarioRecibio || '') +
      '\n\n' +
      '--- TARIFAS ---\n' +
      'Moto: ' +
      (this.tarifas['moto'] || 0) +
      '\n' +
      'Automovil: ' +
      (this.tarifas['automovil'] || 0) +
      '\n' +
      'Turbo: ' +
      (this.tarifas['turbo'] || 0) +
      '\n' +
      'Camion: ' +
      (this.tarifas['camion'] || 0) +
      '\n\n' +
      'Nota: Servicio valido por 12 horas.\n' +
      'Si excede el tiempo, aumentara su tarifa.\n\n' +
      '\x1B\x61\x01' + // Centrar código de barras
      '\x1D\x68\x60' + // Altura un poco más grande (96 en decimal)
      '\x1D\x77\x03' + // Ancho un poco más grande
      '\x1D\x6B\x49' + // CODE128
      String.fromCharCode(codigo.length) +
      codigo +
      '\n' +
      codigo +
      '\n\n' +
      '--- INFORMACION ---\n' +
      '\x1B\x61\x00' + // Alinear izquierda
      '- Por favor asegurese de cerrar bien sus\n' +
      'ventanas y puertas con llave.\n\n' +
      '- No nos hacemos responsables por danos, robos, y/o perdidas al vehiculo y/o sus pertenencias\n' +
      'que fueran causadas por terceras personas.\n\n' +
      '- Antes de retirar su vehiculo, obligatoriamente debe mostrar este ticket, en caso de perdida\n' +
      'presentar el documento de propiedad o que acredite la misma.\n\n' +
      '\x1B\x61\x01' + // Centrar pie
      '¡Gracias por preferirnos!\n\n' +
      '\x1D\x56\x42\x00' // Corte parcial
    );
  }

  reimprimirTicket(): void {
    if (this.formularioReimpresion.valid) {
      const codigo = this.formularioReimpresion.get('codigo')?.value;
      this.ticketService.getTicketByCodigo(codigo).subscribe({
        next: async (ticket) => {
          if (ticket) {
            const texto = this.generarEscPos(ticket);
            try {
              await this.qzService.imprimirTexto('ticket', texto);
              this.mensajeService.success('Ticket reimpreso correctamente.');
            } catch (err) {
              this.mensajeService.error('No se pudo reimprimir el ticket.');
              console.error(err);
            }
          } else {
            this.mensajeService.error('No se encontró ningún ticket con ese código.');
          }
          this.formularioReimpresion.reset();
        },
        error: (error) => {
          this.mensajeService.error('No se encontró ningún ticket con ese código.');
          this.formularioReimpresion.reset();
        }
      });
    } else {
      this.mensajeService.error('Por favor ingrese un código.');
      this.formularioReimpresion.markAllAsTouched();
    }
  }
}
