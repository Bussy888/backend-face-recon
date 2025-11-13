const express = require("express");
const nodemailer = require("nodemailer");
const whatsappClient = require("../controllers/whatsapp");

const router = express.Router();

// Objeto temporal para códigos de prueba
const verificationCodes = {};

// Correo y teléfono fijos para pruebas
const TEST_EMAIL = "mateo8michel8@gmail.com";
const TEST_PHONE = "+59162449894"; // número de prueba con prefijo de Bolivia

// 📩 Enviar código por correo (fijo)
router.post("/send-verification-email", async (_req, res) => {
  try {
    const codigo = Math.floor(100000 + Math.random() * 900000);
    verificationCodes[TEST_EMAIL] = { code: codigo, expires: Date.now() + 1 * 60 * 1000 };

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Instituto Transmite" <${process.env.EMAIL_USER}>`,
      to: TEST_EMAIL,
      subject: "🔐 Código de verificación",
      html: `<p>Tu código de verificación es: <strong>${codigo}</strong><br/>Expira en 1 minuto.</p>`,
    });

    res.json({ message: `Código enviado por correo a ${TEST_EMAIL}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al enviar código por correo" });
  }
});

// 📱 Enviar código por WhatsApp (fijo)
router.post("/send-verification-whatsapp", async (_req, res) => {
  try {
    const codigo = Math.floor(100000 + Math.random() * 900000);
    verificationCodes[TEST_PHONE] = { code: codigo, expires: Date.now() + 5 * 60 * 1000 };

    await whatsappClient.sendMessage(
      `${TEST_PHONE.replace("+", "")}@c.us`,
      `🔐 Tu código de verificación es: *${codigo}*\n⚠️ Expira en 1 minuto.`
    );

    res.json({ message: `Código enviado por WhatsApp a ${TEST_PHONE}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al enviar código por WhatsApp" });
  }
});

// 🔍 Verificación
router.post("/verify-code", (req, res) => {
  const { user, code } = req.body; // user puede ser TEST_EMAIL o TEST_PHONE

  if (!user || !code) return res.status(400).json({ message: "Faltan datos" });

  const record = verificationCodes[user];
  if (!record) return res.status(404).json({ message: "No hay código para este usuario" });

  if (Date.now() > record.expires) {
    delete verificationCodes[user];
    return res.status(400).json({ message: "El código ha expirado" });
  }

  if (parseInt(code) !== record.code) return res.status(400).json({ message: "Código incorrecto" });

  delete verificationCodes[user];
  res.json({ message: "Código verificado correctamente" });
});

module.exports = router;
