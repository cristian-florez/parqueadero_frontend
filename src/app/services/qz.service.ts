import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import qz from 'qz-tray';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QzService {
  constructor(private http: HttpClient) {
    // Forzar promesas estándar
    qz.api.setPromiseType(
      (
        resolver: (
          executor: (
            resolve: (value?: unknown) => void,
            reject: (reason?: unknown) => void
          ) => void
        ) => Promise<unknown>
      ) => new Promise(resolver)
    );

    // ✅ Certificado público (digital-certificate.txt)
    qz.security.setCertificatePromise(
      (
        resolve: (cert: string) => void,
        reject: (reason?: unknown) => void
      ) => {
        firstValueFrom(
          this.http.get('/assets/digital-certificate.txt', {
            responseType: 'text',
          })
        )
          .then((cert) => resolve(cert))
          .catch((err) => reject(err));
      }
    );

    // ✅ Usar backend para firmar con la clave privada
    qz.security.setSignaturePromise((toSign: string) => {
      return (
        resolve: (signed: string) => void,
        reject: (reason?: any) => void
      ) => {
        fetch('http://localhost:8080/api/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request: toSign }),
        })
          .then((res) => res.text())
          .then((signature: string) => resolve(signature))
          .catch((err: any) => reject(err));
      };
    });
  }

  async conectar(): Promise<void> {
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }
  }

  /**
   * Obtiene la lista de impresoras disponibles que detecta QZ Tray.
   */
  async getPrinters(): Promise<string[]> {
    await this.conectar();
    return await qz.printers.find();
  }

  async imprimirTexto(nombreImpresora: string, texto: string): Promise<void> {
    await this.conectar();

    // ESC/POS básico → reset + texto + corte de papel
    const data = [
      {
        type: 'raw',
        format: 'plain',
        data: '\x1B\x40' + texto + '\n\n\n' + '\x1D\x56\x00',
      },
    ];

    // Si el nombre es 'SIMULATE', muestra en consola en lugar de imprimir.
    if (nombreImpresora.toUpperCase() === 'SIMULATE') {
      console.log('--- SIMULACIÓN DE IMPRESIÓN ---');
      console.log('Impresora:', nombreImpresora);
      console.log('Datos a imprimir:', data[0].data);
      console.log('--- FIN DE SIMULACIÓN ---');
      return Promise.resolve();
    }

    const printer = await qz.printers.find(nombreImpresora);
    if (!printer) {
      throw new Error(`Impresora no encontrada: ${nombreImpresora}`);
    }
    const cfg = qz.configs.create(printer);

    await qz.print(cfg, data);
  }
}
