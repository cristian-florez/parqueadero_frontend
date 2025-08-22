import { Vehiculo } from './vehiculo';
import { Pago } from './pago';

export interface Ticket {
    id?: number;
    codigoBarrasQR: string;
    fechaHoraEntrada: Date;
    fechaHoraSalida?: Date;
    pagado: boolean;
    usuarioRecibio: string;
    usuarioEntrego?: string;
    vehiculo: Vehiculo;
    pago: Pago;

}