import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { CierreTurnoService } from '../../services/cierre-turno.service';
import { TicketCierreTurnoResponse } from '../../models/cierreTurno';
import { MensajeService } from '../../services/mensaje.service';
import { QzService } from '../../services/qz.service';
import { Page } from '../../core/types/page';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FiltrosDTO } from '../../models/filtros';
import { FiltroService } from '../../services/filtro.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatIconModule,
  ],
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css'],
  providers: [DatePipe],
})
export class TurnosComponent implements OnInit {
  cierres: TicketCierreTurnoResponse[] = [];

  public totalElementos = 0;
  public size = 10;
  public index = 0;
  public filtros = {
    inicio: '',
    fin: '',
    usuario: undefined as string | undefined,
  };
  public filtrosAbiertos = false;

  filtrosDTO: FiltrosDTO = {
    usuarios: [],
    tiposVehiculo: [],
    parqueaderos: [],
  };

  constructor(
    private cierreTurnoService: CierreTurnoService,
    private mensajeService: MensajeService,
    private qzService: QzService,
    private datePipe: DatePipe,
    private filtrosService: FiltroService
  ) {}

  ngOnInit(): void {
    this.cargarCierres();
    this.filtrosService.getFiltros().subscribe({
      next: (data) => (this.filtrosDTO = data),
      error: (err) => console.error('Error cargando filtros', err),
    });
  }

  cargarCierres(): void {
    this.cierreTurnoService
      .obtenerTodos(this.index, this.size, this.filtros)
      .subscribe({
        next: (page: Page<TicketCierreTurnoResponse>) => {
          this.cierres = page.content;
          this.totalElementos = page.totalElements;
        },
        error: () => {
          this.mensajeService.error('Error al cargar los cierres de turno.');
          this.cierres = [];
          this.totalElementos = 0;
        },
      });
  }

  public cambiarPagina(event: PageEvent): void {
    this.index = event.pageIndex;
    this.size = event.pageSize;
    this.cargarCierres();
  }

  public aplicarFiltros(): void {
    this.index = 0;
    this.cargarCierres();
  }

  public limpiarFiltros(): void {
    this.filtros = {
      inicio: '',
      fin: '',
      usuario: undefined,
    };
  }

  /**
   * Método reutilizable para imprimir un cierre de turno por su ID.
   * @param id El ID del cierre de turno a reimprimir.
   */
  async reimprimirCierrePorId(id: number): Promise<void> {
    this.cierreTurnoService.obtenerCierrePorId(id).subscribe({
      next: async (cierreInfo) => {

        try {
          const texto = this.generarTicketHistorial(cierreInfo);
          await this.qzService.imprimirTexto('SIMULATE', texto);
          this.mensajeService.success('Enviando reimpresión a la impresora.');
        } catch (error) {
          this.mensajeService.error('No se pudo reimprimir el ticket.');
          console.error(error);
        }
      },
      error: (err) => {
        this.mensajeService.error(
          'No se pudo encontrar el cierre de turno para reimprimir.'
        );
        console.error(err);
      },
    });
  }

  private generarTicketHistorial(cierre: TicketCierreTurnoResponse): string {
    const INIT = '\x1B\x40';
    const ALIGN_CENTER = '\x1B\x61\x01';
    const ALIGN_LEFT = '\x1B\x61\x00';
    const CUT_PARTIAL = '\x1D\x56\x42\x00';
    const SEP = '------------------------\n';

    const formatCOP = (value: number) =>
      '$' + Math.round(value).toLocaleString('es-CO');
    const formatDate = (date: string) =>
      this.datePipe.transform(date, 'dd/MM/yy, h:mm a') || '';

    let out = '';
    out += INIT;
    out += ALIGN_CENTER;
    out += 'ESTACION DE SERVICIO EL SAMAN\n';
    out += 'Copia de Cierre de Turno\n';
    out += SEP;

    out += ALIGN_LEFT;
    out += `Vendedor: ${cierre.nombreUsuario}\n`;
    out += `Inicio: ${formatDate(cierre.fechaInicio)}\n`;
    out += `Fin: ${formatDate(cierre.fechaCierre)}\n`;
    out += SEP;

    out += `Total Ingresos: ${formatCOP(cierre.total)}\n`;
    out += SEP;

    out += ALIGN_CENTER;
    out += '¡Gracias por tu buen trabajo!\n\n';
    out += CUT_PARTIAL;

    return out;
  }
}
