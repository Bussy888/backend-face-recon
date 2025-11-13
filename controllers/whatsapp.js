// whatsapp.js
const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  puppeteer: {
    headless: true, // Cambia a false si quieres ver el navegador
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Mostrar QR en consola para enlazar
client.on("qr", (qr) => {
  console.log("Escanea este QR con tu WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp conectado y listo!");
});

client.initialize();

module.exports = client;
