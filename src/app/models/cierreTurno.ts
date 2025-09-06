import { TotalVehiculosDTO } from "./vehiculos";
import { Vehiculo } from "./vehiculos";

export interface CierreReimpresionResponse {
  nombreUsuario: string;
  fechaInicioTurno: string;
  fechaFinTurno: string;
  totalIngresos: number;
  detallesJson: string;
}

export interface DetalleParqueaderoCierre {
  listaVehiculosEntrantes: Vehiculo[];
  listaVehiculosSalientes: Vehiculo[];
  totalAPagar: number;
  vehiculosMensualidad: Vehiculo[];
  vehiculosEnParqueadero: Vehiculo[];
  listaTiposVehiculosEntrantes: TotalVehiculosDTO[];
  listaTiposVehiculosSalientes: TotalVehiculosDTO[];
  listaTiposVehiculosParqueadero: TotalVehiculosDTO[];
}

export interface TicketCierreResponse {
  usuario: string;
  fechaInicio: string;
  fechaFinal: string;
  total: number;
}

export interface TicketCierreTurno {
  fechaInicio: string;
  fechaCierre: string;
  total: number;
  detallesPorParqueadero: Record<string, DetalleParqueaderoCierre>;
}

