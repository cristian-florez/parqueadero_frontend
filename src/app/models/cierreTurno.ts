import { TotalVehiculosDTO, VehiculoCierre } from "./vehiculos";
import { Vehiculo } from "./vehiculos";

export interface DetalleParqueaderoCierre {
  listaVehiculosEntrantes: Vehiculo[];
  listaVehiculosSalientes: VehiculoCierre[];
  totalAPagar: number;
  vehiculosMensualidad: VehiculoCierre[];
  vehiculosEnParqueadero: Vehiculo[];
  listaTiposVehiculosEntrantes: TotalVehiculosDTO[];
  listaTiposVehiculosSalientes: TotalVehiculosDTO[];
  listaTiposVehiculosParqueadero: TotalVehiculosDTO[];
}


export interface TicketCierreTurnoResponse {
  id: number;
  nombreUsuario: string;
  fechaInicio: string;
  fechaCierre: string;
  total: number;
  detallesPorParqueadero: Record<string, DetalleParqueaderoCierre>;
}

