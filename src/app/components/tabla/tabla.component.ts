import { Component, OnInit } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tabla',
  imports: [
    MatPaginatorModule,
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatIconModule,
  ],
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.css',
})
export class TablaComponent implements OnInit {
  public tickets: Ticket[] = [];
  public totalElementos = 0;
  public size = 10;
  public index = 0;
  public filtros = {
    codigo: '',
    placa: '',
    tipo: '',
    usuarioRecibio: '',
    usuarioEntrego: '',
    fechaInicio: undefined as string | undefined,
    fechaFin: undefined as string | undefined,
    pagado: undefined as boolean | undefined,
  };

  public filtrosAbiertos = false;

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.cargarTickets();
  }

  private cargarTickets(): void {
    this.ticketService
      .getTicketsFiltrados(this.index, this.size, this.filtros)
      .subscribe({
        next: (data) => {
          this.tickets = data.content;
          this.totalElementos = data.totalElements;
        },
        error: (error) => {
          console.error('Error fetching tickets:', error);
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
      tipo: '',
      usuarioRecibio: '',
      usuarioEntrego: '',
      fechaInicio: '',
      fechaFin: '',
      pagado: undefined,
    };
  }
}
