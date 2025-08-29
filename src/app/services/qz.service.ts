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
MIIECzCCAvOgAwIBAgIGAZjzbAvzMA0GCSqGSIb3DQEBCwUAMIGiMQswCQYDVQQG
EwJVUzELMAkGA1UECAwCTlkxEjAQBgNVBAcMCUNhbmFzdG90YTEbMBkGA1UECgwS
UVogSW5kdXN0cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMx
HDAaBgkqhkiG9w0BCQEWDXN1cHBvcnRAcXouaW8xGjAYBgNVBAMMEVFaIFRyYXkg
RGVtbyBDZXJ0MB4XDTI1MDgyODAxMjMyMVoXDTQ1MDgyODAxMjMyMVowgaIxCzAJ
BgNVBAYTAlVTMQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYD
VQQKDBJRWiBJbmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMs
IExMQzEcMBoGCSqGSIb3DQEJARYNc3VwcG9ydEBxei5pbzEaMBgGA1UEAwwRUVog
VHJheSBEZW1vIENlcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC8
hNZ8opIiboTIw/huR2OksycIIRrsjqkGhOpkh2Khha3v12RQ8u+11prX3kqx02gr
uoIAGdWin6+jx2R5cf27VyFjHKhY2S19x2ZCbqYOUahyCq0tztNpy3lt/4UV7QdB
pDtP33mnB8GOR38qLfzse9BG9sjm6LvZUL/u4jKMQfC97vYkW6Q8xAxsa0SOmbvn
mBa6vVumCTFm+eyueTdJm3/PQ1iLaqofZZnRgHFi48zdaxW1w0GIBKRBIzQCqv7A
gJYJJOA1Njk3YjcINv4o9OXKsPqy731wzDfu7fxXkruBkRwcc1Ykz1yklGRkBUbF
e+OqUJx90ukeR5p7ngXtAgMBAAGjRTBDMBIGA1UdEwEB/wQIMAYBAf8CAQEwDgYD
VR0PAQH/BAQDAgEGMB0GA1UdDgQWBBRylB6FRaQVuMtNI6WbxWdP48m1CzANBgkq
hkiG9w0BAQsFAAOCAQEACBcddgSeXCv8VUPZLTuUolMFgk2UFMZW+Ejfwln/rdyr
4eAbuH+tpGYsYX6JX5F0z5kyIeNBsWFaGK3gUhUClMnOHn08vKTELIQju9XfVCzm
tbkcXvKhcVhYlkRevi+FnILW51MV4wyQpIXPxeSgOsfzdFjdWI5kPZbOj4fyHs3Q
t4xO9I7zDlj41diDjJaE3SR8HJJDopZSobafn1FoTRaXyihAZ3B8t2HI6naxA52M
U7UIWdwIaTnx5CCubQvCFvep4GfB6eD2Nuk7FaBt0NJ/Qe1G5sJOVX3EVpTLEqpm
Icq3QLsZJi8FGuG2vNGfj8Q0D8LvmU1KSMACiT3uPA==
-----END CERTIFICATE-----`);
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
