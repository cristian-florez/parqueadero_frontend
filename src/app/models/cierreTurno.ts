import { Vehiculo } from "./vehiculo";

export type TipoVehiculo = [string, number];

// Esta es la entidad que se guarda y se obtiene de la API de CierreTurno
export interface CierreTurno {
  id: number;
  nombreUsuario: string;
  fechaCreacion: string; // o Date
  fechaInicioTurno: string; // o Date
  fechaFinTurno: string; // o Date
  totalIngresos: number;
  totalVehiculosEntraron: number;
  totalVehiculosSalieron: number;
  vehiculosRestantes: number;
  detalleEntrantes: string;
  detalleSalientes: string;
  detalleRestantes: string;
}


// Este es el DTO que se usa para los cálculos en el frontend
export interface TicketCierreTurno {
  totalVehiculosQueEntraron: Vehiculo[];
  totalVehiculosQueSalieron: Vehiculo[];
  totalAPagar: number;
  vehiculosEnParqueadero: Vehiculo[];
  tipoVehiculosEntrantes: TipoVehiculo[];
  tipoVehiculosSaliente: TipoVehiculo[];
  tipoVehiculosParqueadero: TipoVehiculo[];
  tipoVehiculoParqueadero: TipoVehiculo[];
}
