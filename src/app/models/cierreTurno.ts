import { Vehiculo } from "./vehiculo";

export type TipoVehiculo = [string, number];

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
