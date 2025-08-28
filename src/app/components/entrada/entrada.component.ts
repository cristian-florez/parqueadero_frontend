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


@Component({
  selector: 'app-entrada',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './entrada.component.html',
  styleUrls: ['./entrada.component.css'],
})
export class EntradaComponent implements OnInit {
  formularioEntrada: FormGroup;
  formularioReimpresion: FormGroup; // 👈 new form group

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

    // 👇 new form group initialization
    this.formularioReimpresion = this.fb.group({
      codigo: ['', Validators.required],
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

    // 🔹 Suscripción para convertir la placa a mayúsculas automáticamente
    const placaControl = this.formularioEntrada.get('vehiculo.placa');
    placaControl?.valueChanges.subscribe((valor: string) => {
      if (valor && valor !== valor.toUpperCase()) {
        placaControl.setValue(valor.toUpperCase(), { emitEvent: false });
      }
    });
  }

  onSubmit(): void {
    if (this.formularioEntrada.valid) {
      const nuevoTicket: Ticket = this.formularioEntrada.value;
      nuevoTicket.usuarioRecibio = this.usuario?.nombre || '';

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
      '\n' +
      'Nota: Servicio valido por 12 horas.\n' +
      'Si excede el tiempo, debe pagar de nuevo.\n\n' +
      '\x1B\x61\x01' + // Centrar código de barras
      '\x1D\x68\x50' + // Altura
      '\x1D\x77\x02' + // Ancho
      '\x1D\x6B\x49' + // CODE128
      String.fromCharCode(codigo.length) +
      codigo +
      '\n' +
      codigo +
      '\n\n' +
      '--- INFORMACION LEGAL ---\n' +
      '\x1B\x61\x00' + // Alinear izquierda
      '- El parqueadero responde por afectaciones al vehiculo.\n' +
      '- No responde por objetos de valor no declarados.\n' +
      '- Reclamos: hasta 15 dias habiles.\n\n' +
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
