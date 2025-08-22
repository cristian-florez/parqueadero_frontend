import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class MensajeService {
  constructor(private snackBar: MatSnackBar) {}

  success(mensaje: string) {
    this.snackBar.open(mensaje, '', {
      duration: 3000,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  error(mensaje: string) {
    this.snackBar.open(mensaje, '', {
      duration: 3000,
      panelClass: ['snackbar-error'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
