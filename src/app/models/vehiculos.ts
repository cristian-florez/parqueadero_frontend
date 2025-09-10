export interface Vehiculo {
  id: number;
  placa: string;
  tipo: string;
}

export interface TotalVehiculosDTO {
  tipo: string;
  cantidad: number;
}

export interface VehiculoCierre {
  placa: string;
  tipo: string;
  totalCobrado: number;
}
