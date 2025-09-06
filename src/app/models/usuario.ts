export interface Usuario {
  id: number;
  nombre: string;
  cedula: string;
  fechaInicioSesion: string;
}

export interface UsuarioLogin {
  nombre: string;
  cedula: string;
}
