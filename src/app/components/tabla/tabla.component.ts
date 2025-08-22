import { Component, OnInit } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket';

@Component({
  selector: 'app-tabla',
  imports: [MatPaginatorModule, CommonModule],
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.css',
})
export class TablaComponent implements OnInit {
  public tickets: Ticket[] = [];
  public totalElementos = 0;
  public size = 10;
  public index = 0;

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.cargarTickets();
  }

  private cargarTickets(): void {
    this.ticketService.getTickets(this.index, this.size).subscribe({
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
}
