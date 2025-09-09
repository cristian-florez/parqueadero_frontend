function actualizarReloj() {
  const reloj = document.getElementsByClassName("reloj")[0];
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  const segundos = String(ahora.getSeconds()).padStart(2, "0");
  if (reloj) {
    reloj.textContent = `${horas}:${minutos}:${segundos}`;
  }
}
setInterval(actualizarReloj, 1000);
actualizarReloj();
