
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { CierreTurnoService } from '../../services/cierre-turno.service';
import { CierreTurno } from '../../models/cierreTurno';
import { MensajeService } from '../../services/mensaje.service';
import { QzService } from '../../services/qz.service';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css'],
  providers: [DatePipe] // Proveer DatePipe
})
export class TurnosComponent implements OnInit {
  filtroForm: FormGroup;
  cierres: CierreTurno[] = [];
  cierresFiltrados: CierreTurno[] = [];

  constructor(
    private fb: FormBuilder,
    private cierreTurnoService: CierreTurnoService,
    private mensajeService: MensajeService,
    private qzService: QzService, // Inyectar QzService
    private datePipe: DatePipe // Inyectar DatePipe
  ) {
    this.filtroForm = this.fb.group({
      inicio: [''],
      fin: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCierres();
  }

  cargarCierres(): void {
    this.cierreTurnoService.obtenerTodosLosCierres().subscribe({
      next: (data) => {
        this.cierres = data;
        this.cierresFiltrados = data;
      },
      error: () => {
        this.mensajeService.error('Error al cargar los cierres de turno.');
      }
    });
  }

  aplicarFiltros(): void {
    const { inicio, fin } = this.filtroForm.value;
    let resultado = this.cierres;

    if (inicio) {
      const fechaInicio = new Date(inicio);
      resultado = resultado.filter(c => new Date(c.fechaInicioTurno) >= fechaInicio);
    }

    if (fin) {
      const fechaFin = new Date(fin);
      resultado = resultado.filter(c => new Date(c.fechaFinTurno) <= fechaFin);
    }

    this.cierresFiltrados = resultado;
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({ inicio: '', fin: '' });
    this.cierresFiltrados = this.cierres;
  }

  async imprimirCierre(cierre: CierreTurno): Promise<void> {
    try {
      const texto = this.generarTicketHistorial(cierre);
      await this.qzService.imprimirTexto('ticket', texto);
      this.mensajeService.success('Enviando ticket a la impresora.');
    } catch (error) {
      this.mensajeService.error('No se pudo imprimir el ticket.');
      console.error(error);
    }
  }

  private generarTicketHistorial(cierre: CierreTurno): string {
    const INIT = '\x1B\x40';
    const ALIGN_CENTER = '\x1B\x61\x01';
    const ALIGN_LEFT = '\x1B\x61\x00';
    const CUT_PARTIAL = '\x1D\x56\x42\x00';
    const SEP = '------------------------\n';

    const formatCOP = (value: number) => '$'
 + Math.round(value).toLocaleString('es-CO');
    const formatDate = (date: string) => this.datePipe.transform(date, 'dd/MM/yy, h:mm a') || '';

    let out = '';
    out += INIT;
    out += ALIGN_CENTER;
    out += 'ESTACION DE SERVICIO EL SAMAN\n';
    out += 'Copia de Cierre de Turno\n';
    out += SEP;

    out += ALIGN_LEFT;
    out += `Vendedor: ${cierre.nombreUsuario}\n`;
    out += `Inicio: ${formatDate(cierre.fechaInicioTurno)}\n`;
    out += `Fin: ${formatDate(cierre.fechaFinTurno)}\n`;
    out += SEP;

    out += `Total Ingresos: ${formatCOP(cierre.totalIngresos)}\n`;
    out += SEP;

    out += '--- RESUMEN ---\n';
    out += `Vehiculos que entraron: ${cierre.totalVehiculosEntraron}\n`;
    out += `(${cierre.detalleEntrantes || 'N/A'})\n\n`;

    out += `Vehiculos que salieron: ${cierre.totalVehiculosSalieron}\n`;
    out += `(${cierre.detalleSalientes || 'N/A'})\n\n`;

    out += `Vehiculos restantes: ${cierre.vehiculosRestantes}\n`;
    out += `(${cierre.detalleRestantes || 'N/A'})\n`;
    out += SEP;

    out += ALIGN_CENTER;
    out += '¡Gracias por tu buen trabajo!\n\n';
    out += CUT_PARTIAL;

    return out;
  }
}
