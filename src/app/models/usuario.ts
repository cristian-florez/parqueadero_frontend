// ==========================
// archivo: usuario.ts
// ==========================

export interface Usuario {
  id?: number; // opcional porque al crear un usuario nuevo el ID lo genera el backend
  nombre: string; // nombre completo del usuario
  cedula: string; // cédula del usuario
}
