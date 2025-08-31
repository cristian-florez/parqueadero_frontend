import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Usuario } from '../../../models/usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { TicketService } from '../../../services/ticket.service';
import { MensajeService } from '../../../services/mensaje.service';
import { QzService } from '../../../services/qz.service';
import { CommonModule } from '@angular/common';
import { TicketCierreTurno } from '../../../models/cierreTurno';
import { CierreTurnoService } from '../../../services/cierre-turno.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule],
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
    private qzService: QzService,
    private cierreTurnoService: CierreTurnoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.usuarioService.usuarioActual$.subscribe((user) => {
      this.usuario = user;
    });
  }


  async logout(): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de que quieres cerrar el turno?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const datosGuardados = localStorage.getItem('usuarioActual');

        if (datosGuardados) {
          const usuario: Usuario = JSON.parse(datosGuardados);
          const fechaInicial: Date = new Date(usuario.fechaInicioSesion);
          const fechaFinal: Date = new Date();

          // Llamada única que guarda el cierre y devuelve el DTO para imprimir
          this.cierreTurnoService.crearCierre(fechaInicial, fechaFinal).subscribe({
            next: async (cierreTurnoDto) => {
              this.mensajeService.success('Cierre de turno guardado correctamente.');

              // Generar el texto para el ticket con el DTO recibido
              const texto = this.generarTicketCierre(cierreTurnoDto, usuario.nombre, fechaInicial, fechaFinal);

              // Imprimir
              try {
                await this.qzService.imprimirTexto('ticket', texto);
              } catch (err) {
                this.mensajeService.error('No se pudo imprimir el ticket de cierre.');
                console.error(err);
              }

              // Finalizar sesión
              this.usuarioService.logout();
              this.router.navigate(['/login']);
            },
            error: (err) => {
              console.error('Error al crear el cierre de turno', err);
              this.mensajeService.error('Ocurrió un error al generar el cierre de turno.');
              // Aún si todo falla, permitir al usuario cerrar sesión
              this.usuarioService.logout();
              this.router.navigate(['/login']);
            }
          });
        }
      }
    });
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
