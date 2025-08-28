import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Usuario } from '../../../models/usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { TicketService } from '../../../services/ticket.service';
import { MensajeService } from '../../../services/mensaje.service';
import { QzService } from '../../../services/qz.service';
import { CommonModule } from '@angular/common';
import { TicketCierreTurno } from '../../../models/cierreTurno';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  usuario: Usuario | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private ticketService: TicketService,
    private mensajeService: MensajeService,
    private qzService: QzService
  ) {}

  ngOnInit(): void {
    this.usuarioService.usuarioActual$.subscribe((user) => {
      this.usuario = user;
    });
  }


  async logout(): Promise<void> {
    // Recuperar el objeto desde el localStorage
    const datosGuardados = localStorage.getItem('usuarioActual');

    if (datosGuardados) {
      const objeto = JSON.parse(datosGuardados);

      // Si quieres manejarlo como Date en TypeScript
      const fechaInicial: Date = new Date(objeto.fecha);
      const fechaFinal: Date = new Date();

      this.ticketService.obtenerDatosCierre(fechaInicial, fechaFinal).subscribe({
        next: async (cierreTurno: TicketCierreTurno) => {
          const texto = this.generarTicketCierre(cierreTurno, objeto.usuario, fechaInicial, fechaFinal);

          try {
            await this.qzService.imprimirTexto('ticket', texto);
          } catch (err) {
            this.mensajeService.error('No se pudo imprimir el ticket');
            console.error(err);
          }
            this.usuarioService.logout();
            this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error al obtener cierre de turno', err);
          this.usuarioService.logout();
          this.router.navigate(['/login']);
        },
      });
    }
  }

  private generarTicketCierre(
    cierreTurno: TicketCierreTurno,
    usuario: string,
    fechaInicio: Date,
    fechaFinal: Date
  ): string {

    // === 0) Constantes ESC/POS ===
    const INIT = '\x1B\x40'; // Inicializar
    const ALIGN_CENTER = '\x1B\x61\x01';
    const ALIGN_LEFT = '\x1B\x61\x00';
    const CUT_PARTIAL = '\x1D\x56\x42\x00'; // Corte parcial
    const SEP = '------------------------\n';

    // === 1) Helpers de formato (pensados para principiantes) ===
    // Formato de moneda para Colombia (COP) sin decimales
    const formatCOP = (value: number) =>
      '$' + Math.round(value).toLocaleString('es-CO');

    // Lista "tipo: cantidad" (ej: "Carro: 11")
    const renderTipos = (items: [string, number][] | undefined) =>
      items && items.length
        ? items.map((i) => `${i[0]}: ${i[1]}`).join('||') + '\n'
        : 'Ninguno\n';

    // Lista de vehículos "Placa: ABC123 | Tipo: Carro"
    const renderVehiculos = (
      items: { placa: string; tipo: string }[] | undefined
    ) =>
      items && items.length
        ? items.map((v) => `Placa: ${v.placa} | Tipo: ${v.tipo}`).join('\n') +
          '\n'
        : 'Ninguno\n';

    // === 2) Construcción del ticket ===
    let out = '';

    // Encabezado
    out += INIT;
    out += ALIGN_CENTER;
    out += 'ESTACION DE SERVICIO EL SAMAN\n';
    out += 'Calle 5 cra 15 esquina Alcala-Valle\n\n';
    out += 'CIERRE DE TURNO\n';
    out += SEP;

    // datos turno
    out += ALIGN_LEFT;
    out += 'Vendedor: ' + (usuario || '') + '\n';
    out += 'Inicio de turno: ' + (fechaInicio.toLocaleString() || '') + '\n';
    out += 'Cierre de turno: ' + (fechaFinal.toLocaleString() || '') + '\n';
    out += '\n\n';

    // Tipos de vehículos ENTRANTES
    out += ALIGN_LEFT;
    out += '--- VEHICULOS QUE ENTRARON ---\n';
    out += renderTipos(cierreTurno.tipoVehiculosEntrantes);
    out += '\n\n';

    // Vehículos que ENTRARON
    out += renderVehiculos(cierreTurno.totalVehiculosQueEntraron);
    out += '\n';

    // Tipos de vehículos SALIENTES
    out += '--- VEHICULOS QUE SALIERON ---\n';
    out += renderTipos(cierreTurno.tipoVehiculosSaliente);
    out += '\n\n';

    // Vehículos que SALIERON
    out += renderVehiculos(cierreTurno.totalVehiculosQueSalieron);
    out += '\n';

    // Tipos de vehículos EN PARQUEADERO
    out += '--- VEHICULOS EN PARQUEADERO ---\n';
    out += renderTipos(cierreTurno.tipoVehiculosParqueadero);
    out += '\n\n';

    // Vehículos que ESTAN EN PARQUEADERO
    out += renderVehiculos(cierreTurno.vehiculosEnParqueadero);
    out += '\n';

    // Total a pagar
    out += SEP;
    out += `TOTAL A ENTREGAR: ${formatCOP(cierreTurno.totalAPagar)}\n\n`;

    // Pie y corte
    out += ALIGN_CENTER;
    out += '¡Gracias por tu buen trabajo!\n\n';
    out += CUT_PARTIAL;

    return out;
  }
}
