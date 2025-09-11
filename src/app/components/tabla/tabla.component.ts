import { Component, OnInit } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../services/ticket.service';
import { TicketResponse } from '../../models/tickets';
import { MensajeService } from '../../services/mensaje.service';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Page } from '../../core/types/page';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FiltrosDTO } from '../../models/filtros';
import { FiltroService } from '../../services/filtro.service';

@Component({
  selector: 'app-tabla',
  imports: [
    MatPaginatorModule,
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.css',
})
export class TablaComponent implements OnInit {
  public tickets: TicketResponse[] = [];

  public totalElementos = 0;
  public size = 10;
  public index = 0;
  public filtros = {
    codigo: '',
    placa: '',
    tipoVehiculo: undefined as string | undefined,
    usuarioRecibio: undefined as string | undefined,
    usuarioEntrego: undefined as string | undefined,
    parqueadero: undefined as string | undefined,
    fechaInicio: undefined as string | undefined,
    fechaFin: undefined as string | undefined,
    pagado: undefined as boolean | undefined,
  };

  public filtrosAbiertos = false;

  filtrosDTO: FiltrosDTO = {
    usuarios: [],
    tiposVehiculo: [],
    parqueaderos: [],
  };

  constructor(
    private ticketService: TicketService,
    private mensajeService: MensajeService,
    private filtrosService: FiltroService
  ) {}

  ngOnInit(): void {
    this.cargarTickets();

    this.filtrosService.getFiltros().subscribe({
      next: (data) => (this.filtrosDTO = data),
      error: (err) => console.error('Error cargando filtros', err),
    });
  }

  private cargarTickets(): void {
    this.ticketService
      .obtenerTodos(this.index, this.size, this.filtros)
      .subscribe({
        next: (page: Page<TicketResponse>) => {
          this.tickets = page.content;
          this.totalElementos = page.totalElements;
        },
        error: () => {
          this.mensajeService.error('Error al cargar los tickets.');
          this.tickets = [];
          this.totalElementos = 0;
        },
      });
  }

  public cambiarPagina(event: PageEvent): void {
    this.index = event.pageIndex;
    this.size = event.pageSize;
    this.cargarTickets();
  }

  public aplicarFiltros(): void {
    this.index = 0; // resetear a primera página
    this.cargarTickets();
  }

  public limpiarFiltros(): void {
    this.filtros = {
      codigo: '',
      placa: '',
      tipoVehiculo: undefined,
      usuarioRecibio: undefined,
      usuarioEntrego: '',
      parqueadero: undefined,
      fechaInicio: undefined,
      fechaFin: undefined,
      pagado: undefined,
    };
  }
}
