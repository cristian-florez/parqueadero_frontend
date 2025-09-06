export interface TicketEntradaRequest {
  placa: string;
  tipoVehiculo: string;
  usuarioRecibioId: number;
  parqueadero: string;
}

export interface TicketMensualidadRequest {
  fechaHoraEntrada: string;
  usuarioId: number;
  placa: string;
  tipoVehiculo: string;
  parqueadero: string;
  dias: number;
  total: number;
}

export interface TicketResponse {
  codigo: string;
  placa: string;
  tipoVehiculo: string;
  fechaHoraEntrada: string;
  fechaHoraSalida: string;
  estadoPago: boolean;
  totalPagar: number;
  usuarioRecibio: string;
  usuarioEntrego: string;
  parqueadero: string;
}

export interface TicketSalidaRequest {
  codigo: string;
  idUsuarioLogueado: number;
}
