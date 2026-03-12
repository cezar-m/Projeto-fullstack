import fetch from "node-fetch";

setInterval(async () => {
  try {
    await fetch("https://projeto-fullstack-djir.onrender.com/");
    console.log("Ping enviado para manter alive");
  } catch (err) {
    console.error("Erro ao pingar:", err);
  }
}, 5 * 60 * 1000); // a cada 5 minutos
