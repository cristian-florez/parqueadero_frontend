import { Injectable } from '@angular/core';
import qz from 'qz-tray';

@Injectable({ providedIn: 'root' })
export class QzService {
  constructor() {
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
        _reject: (reason?: unknown) => void
      ) => {
        resolve(`-----BEGIN CERTIFICATE-----
MIIECzCCAvOgAwIBAgIGAZjjuGeKMA0GCSqGSIb3DQEBCwUAMIGiMQswCQYDVQQG
EwJVUzELMAkGA1UECAwCTlkxEjAQBgNVBAcMCUNhbmFzdG90YTEbMBkGA1UECgwS
UVogSW5kdXN0cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMx
HDAaBgkqhkiG9w0BCQEWDXN1cHBvcnRAcXouaW8xGjAYBgNVBAMMEVFaIFRyYXkg
RGVtbyBDZXJ0MB4XDTI1MDgyNTAwMTI0OVoXDTQ1MDgyNTAwMTI0OVowgaIxCzAJ
BgNVBAYTAlVTMQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYD
VQQKDBJRWiBJbmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMs
IExMQzEcMBoGCSqGSIb3DQEJARYNc3VwcG9ydEBxei5pbzEaMBgGA1UEAwwRUVog
VHJheSBEZW1vIENlcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCr
dfiXhjiWsonQ7x5h7GJhCUoDLL/61qFrQ7zKBNuVXv1aR+Hw+u0DUqVoQe+MQyVb
xFStKvgZ4WcqLe6wBAXGgjqeZeoBiXGfELIQw42uOhW10e+jx7huzrka9LxN0Gbf
QNjkhUMao8TOYoUKbjxW1pS/JQJS0Tg+5zh/Jebe+FDZnnQsa2IIO8jYEdavaD9o
GHPebw1ztVRqhQUHKr48PhPtH1u9AQu8ZjhIX3SWX9c1g5dd3HOWBr7TUkjtLy5D
pEEXJZ+bHUUtEYpMtwWeYJSfgS3L8BlKP03MhU1lAFH6dqU+W3S5neidaEFpr04w
flDX0YOn3FPaOo3/QqsxAgMBAAGjRTBDMBIGA1UdEwEB/wQIMAYBAf8CAQEwDgYD
VR0PAQH/BAQDAgEGMB0GA1UdDgQWBBQ/wbg9UEgG7QrSYCAjhwkiAzBYXzANBgkq
hkiG9w0BAQsFAAOCAQEAVp39X9+JTX7cU75u8PyUMyN8fUdm6JIGXApVTkPHTdn8
6s4jhQ+ZoMgezy/BolXrYYxOSaciIFp9Q/7HgG14wyEA5OiFYTnqPFUJvoftqdbs
Ov1o9WFXk8AH1UF+VRDMLm4gyf5EnhDdD+BmUTecZmU30EOc9EVc5amcOxxJWASZ
zsWexc3SwVKvdzYxNZB1xLUuRyXhItxGzTbVxaiPWmTXc2y56dnmYwut3cJqFS1r
534TFFilHyP6cJb0vnO3AXjK7XxCw8ikeIMlz3glnz7P6kTTo26L7JIXmhJb75Fr
9CE5azLqrenqrIufhX+i1q71jTLRmfAYvSpnjux5bQ==
-----END CERTIFICATE-----
`);
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

  async imprimirTexto(nombreImpresora: string, texto: string): Promise<void> {
    await this.conectar();
    const printer = await qz.printers.find(nombreImpresora);
    const cfg = qz.configs.create(printer);

    // ESC/POS básico → reset + texto + corte de papel
    const data = [
      {
        type: 'raw',
        format: 'plain',
        data: '\x1B\x40' + texto + '\n\n\n' + '\x1D\x56\x00',
      },
    ];

    await qz.print(cfg, data);
  }
}
