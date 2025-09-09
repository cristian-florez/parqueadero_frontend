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
import { UsuarioService } from '../../services/usuario.service';
import { TarifaService } from '../../services/tarifa.service';
import { QzService } from '../../services/qz.service';
import { Usuario } from '../../models/usuario';
import { DatePipe } from '@angular/common';
import { MensajeService } from '../../services/mensaje.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  TicketEntradaRequest,
  TicketMensualidadRequest,
  TicketResponse,
} from '../../models/tickets';
import { FiltrosDTO } from '../../models/filtros';
import { FiltroService } from '../../services/filtro.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-entrada',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './entrada.component.html',
  styleUrls: ['./entrada.component.css'],
  providers: [DatePipe],
})
export class EntradaComponent implements OnInit {
  visibleForm: string = 'entrada';
  formularioEntrada: FormGroup;
  formularioReimpresion: FormGroup;
  formularioMensualidad: FormGroup;

  usuario: Usuario | null = null;
  tarifas: { [key: string]: number } = {};
  ticketExiste: boolean | null = null;
  reimpresionTouched = false;

  filtros: FiltrosDTO = {
    usuarios: [],
    tiposVehiculo: [],
    parqueaderos: [],
  };

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private mensajeService: MensajeService,
    private usuarioService: UsuarioService,
    private TarifaService: TarifaService,
    private filtrosService: FiltroService,
    private qzService: QzService,
    private datePipe: DatePipe
  ) {
    this.formularioEntrada = this.fb.group({
      placa: ['', Validators.required],
      tipoVehiculo: ['', Validators.required],
      parqueadero: ['', Validators.required],
    });

    this.formularioReimpresion = this.fb.group({
      codigo: ['', Validators.required],
    });

    this.formularioMensualidad = this.fb.group({
      placa: ['', Validators.required],
      tipoVehiculo: ['', Validators.required],
      fechaHoraEntrada: ['', Validators.required],
      parqueadero: ['', Validators.required],
      dias: [null, [Validators.required, Validators.min(1)]],
      total: [null, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.usuarioService.usuarioActual$.subscribe((user) => {
      this.usuario = user;
    });

    this.TarifaService.getTarifas().subscribe((data) => {
      data.forEach((t) => (this.tarifas[t.tipoVehiculo] = t.precioDia));
    });

    this.filtrosService.getFiltros().subscribe({
      next: (data) => (this.filtros = data),
      error: (err) => console.error('Error cargando filtros', err),
    });

    // Suscripción para formularioEntrada
    const placaControlEntrada = this.formularioEntrada.get('placa');
    placaControlEntrada?.valueChanges.subscribe(() => {
      this.convertirAMayusculas(this.formularioEntrada, 'placa');
    });

    // Suscripción para formularioMensualidad
    const placaControlMensualidad = this.formularioMensualidad.get('placa');
    placaControlMensualidad?.valueChanges.subscribe(() => {
      this.convertirAMayusculas(this.formularioMensualidad, 'placa');
    });

    const codigoControl = this.formularioReimpresion.get('codigo');
    codigoControl?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((codigo) => {
          this.reimpresionTouched = true;
          if (codigo) {
            return this.ticketService.obtenerPorCodigo(codigo);
          } else {
            this.ticketExiste = null;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (ticket) => {
          this.ticketExiste = !!ticket;
        },
        error: () => {
          this.ticketExiste = false;
        },
      });
  }

  onSubmitEntrada(): void {
    if (this.formularioEntrada.valid) {
      const ticketEntrada: TicketEntradaRequest = this.formularioEntrada.value;
      //asignamos el usuario al dato faltante del request
      ticketEntrada.usuarioRecibioId = this.usuario?.id || 0;

      this.ticketService.crearEntrada(ticketEntrada).subscribe({
        //el backend me devuelve un objeto TicketResponse
        next: async (respuesta) => {
          await this.imprimirTicket(respuesta, 'entrada');
          this.formularioEntrada.reset();
        },
        error: (error) => {
          this.mensajeService.error(
            'Ocurrió un error al registrar el ticket:' + error
          );
        },
      });
    } else {
      this.mensajeService.error(
        'Por favor complete todos los campos obligatorios'
      );
      this.formularioEntrada.markAllAsTouched();
    }
  }

  onSubmitMensualidad(): void {
    if (this.formularioMensualidad.valid) {
      const ticketMensualidad: TicketMensualidadRequest =
        this.formularioMensualidad.value;
      ticketMensualidad.usuarioId = this.usuario?.id || 0;

      this.ticketService.crearMensualidad(ticketMensualidad).subscribe({
        next: async (respuesta) => {
          //el backend me devuelve un objeto TicketResponse
          await this.imprimirTicket(respuesta, 'mensualidad');
          this.formularioMensualidad.reset();
        },

        error: (error) => {
          this.mensajeService.error(
            'Ocurrió un error al registrar el ticket de mensualidad: ' + error
          );
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
  convertirAMayusculas(form: FormGroup, campo: string) {
    const control = form.get(campo);
    if (control && control.value) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }

  private generarEscPos(ticket: TicketResponse, tipoTicket: string): string {
    const codigo = ticket.codigo || '0000000000';
  const fechaEntrada =
    this.datePipe.transform(ticket.fechaHoraEntrada, 'dd/MM/yyyy HH:mm') || '';
  const fechaSalida =
    ticket.fechaHoraSalida
      ? this.datePipe.transform(ticket.fechaHoraSalida, 'dd/MM/yyyy HH:mm') || ''
      : '';


    let bloqueTarifas = '';

    switch (tipoTicket) {
      case 'entrada':
        bloqueTarifas =
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
          'Si excede el tiempo, aumentara su tarifa.\n\n';
        break;

      case 'mensualidad':
        bloqueTarifas =
          '--- MENSUALIDAD ---\n' +
          'El pago cubre los días acordados.\n' +
          'No se realizan reembolsos por uso parcial.\n\n';
        break;

      default:
        bloqueTarifas = '';
        break;
    }
    return (
      '\x1B\x40' + // Inicializar
      '\x1B\x61\x01' + // Centrar
      'ESTACION DE SERVICIO EL SAMAN\n' +
      'Calle 5 cra 15 esquina Alcala-Valle\n' +
      'cel 3217023382\n' +
      '------------------------\n' +
      '\x1B\x61\x00' + // Alinear izquierda
      'Placa: ' +
      (ticket.placa || '') +
      '\n' +
      'Tipo: ' +
      (ticket.tipoVehiculo || '') +
      '\n' +
      'Entrada: ' +
      fechaEntrada +
      '\n' +
      'Parqueadero: ' +
      ticket.parqueadero +
      '\n' +
      (tipoTicket === 'mensualidad' && ticket.fechaHoraSalida
        ? 'Salida: ' +
          fechaSalida +
          '\n' +
          'Total: $' +
          ticket.totalPagar +
          '\n'
        : 'Atendido por: ' + (ticket.usuarioRecibio || '') + '\n') +
      '\n' +
      bloqueTarifas +
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

  private async imprimirTicket(ticket: TicketResponse, tipo: string) {
    const texto = this.generarEscPos(ticket, tipo);
    try {
      // Usamos 'SIMULATE' para mostrar en consola en lugar de imprimir
      await this.qzService.imprimirTexto('SIMULATE', texto);
      this.mensajeService.success('El ticket se registró correctamente ✅');
    } catch (err) {
      this.mensajeService.error('Ocurrió un error al registrar el ticket');
      console.error(err);
    }
  }

  reimprimirTicket(): void {
    if (this.formularioReimpresion.valid) {
      const codigo = this.formularioReimpresion.get('codigo')?.value;
      let tipoTicket = '';
      //Aca obtenemos un objeto TicketResponse
      this.ticketService.obtenerPorCodigo(codigo).subscribe({
        next: async (ticket) => {
          if (ticket) {
            tipoTicket = codigo.includes('mensualidad')
              ? 'mensualidad'
              : 'entrada';

            const texto = this.generarEscPos(ticket, tipoTicket);
            try {
              await this.qzService.imprimirTexto(
                'SIMULATE',
                texto
              );
              this.mensajeService.success('Ticket reimpreso correctamente.');
            } catch (err) {
              this.mensajeService.error('No se pudo reimprimir el ticket.');
              console.error(err);
            }
          } else {
            this.mensajeService.error(
              'No se encontró ningún ticket con ese código.'
            );
          }
          this.formularioReimpresion.reset();
        },
        error: () => {
          this.mensajeService.error(
            'No se encontró ningún ticket con ese código.'
          );
          this.formularioReimpresion.reset();
        },
      });
    } else {
      this.mensajeService.error('Por favor ingrese un código.');
      this.formularioReimpresion.markAllAsTouched();
    }
  }

  showForm(formName: string): void {
    this.visibleForm = formName;
  }
}
