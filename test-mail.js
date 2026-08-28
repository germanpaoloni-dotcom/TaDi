// Script de diagnóstico para el mail de TaDi — corre AFUERA del servidor,
// para probar la config de SMTP sin tener que pasar por todo el flujo de
// compra. Uso:
//
//   node test-mail.js tu@mail.com
//
// Lee las mismas variables de entorno que usa mailer.js (SMTP_HOST,
// SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM). Si corrés esto en tu máquina
// necesitás cargarlas antes, por ejemplo:
//
//   SMTP_HOST=smtp.gmail.com SMTP_PORT=465 SMTP_USER=administracion@tadi.com.ar SMTP_PASS=xxxxxxxxxxxxxxxx node test-mail.js tu@mail.com
//
// o si usás un archivo .env, con `node -r dotenv/config test-mail.js tu@mail.com`.
//
// El script hace DOS pasos y explica en criollo qué falló en cada uno:
//   1) transporter.verify() — solo chequea que se puede conectar y hacer
//      login en el servidor SMTP. Si esto falla, el problema es de
//      credenciales/red, no de plantilla de mail.
//   2) sendMail() de una prueba real — si el paso 1 pasó pero este falla,
//      el problema es otra cosa (mail de destino inválido, límite de envío
//      de Gmail, etc.)

const nodemailer = require("nodemailer");

const to = process.argv[2];

function checkEnv() {
  const required = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.log("❌ Faltan variables de entorno:", missing.join(", "));
    console.log("   El sitio en este estado manda el mail en 'modo demo' (no envía nada).");
    console.log("   Ver README.md → 'Mails automáticos' para cómo generar SMTP_PASS.");
    process.exit(1);
  }
}

function explainError(step, err) {
  console.log(`\n❌ Falló el paso "${step}".`);
  console.log("   Código:", err.code || "(sin código)");
  console.log("   Mensaje:", err.message);
  console.log("   Respuesta del servidor:", err.response || "(ninguna)");

  const code = String(err.code || "");
  const msg = String(err.message || "").toLowerCase();

  if (code === "EAUTH" || msg.includes("invalid login") || msg.includes("username and password not accepted")) {
    console.log(`
   → Esto es casi siempre: SMTP_PASS mal puesta.
     - Tiene que ser la "contraseña de aplicación" de 16 letras (sin espacios),
       NO la contraseña normal de la cuenta de Google.
     - Se genera en myaccount.google.com/apppasswords, con la verificación en
       2 pasos activada primero.
     - Si esa opción no aparece, el admin del Workspace la tiene deshabilitada
       para el dominio (admin.google.com → Seguridad → Autenticación →
       Contraseñas de aplicación) — hay que habilitarla ahí.
     - Chequeá también que SMTP_USER sea exactamente administracion@tadi.com.ar
       (sin espacios, sin mayúsculas de más).`);
  } else if (code === "ETIMEDOUT" || code === "ECONNREFUSED" || code === "ENETUNREACH" || code === "ESOCKET") {
    console.log(`
   → Esto es de red/puerto, no de credenciales:
     - Si estás corriendo esto en un hosting (Render, etc.), puede que el
       puerto 465 esté bloqueado en el plan gratuito. Probá con
       SMTP_PORT=587 (STARTTLS) en vez de 465.
     - Si estás en tu propia PC, chequeá que no haya un firewall/antivirus
       bloqueando conexiones salientes por SMTP.`);
  } else {
    console.log("\n   → Error no reconocido, pero el mensaje de arriba debería decir qué pasó.");
  }
  process.exit(1);
}

(async () => {
  checkEnv();

  console.log("Config detectada:");
  console.log("  SMTP_HOST:", process.env.SMTP_HOST);
  console.log("  SMTP_PORT:", process.env.SMTP_PORT || "465 (default)");
  console.log("  SMTP_USER:", process.env.SMTP_USER);
  console.log("  SMTP_PASS:", process.env.SMTP_PASS ? `(${process.env.SMTP_PASS.length} caracteres)` : "(vacía)");
  console.log("  SMTP_FROM:", process.env.SMTP_FROM || "(usa SMTP_USER)");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    family: 4,
  });

  console.log("\n1) Probando conexión y login (transporter.verify)...");
  try {
    await transporter.verify();
    console.log("✅ Conexión y login OK. El problema (si hay uno) no es de credenciales.");
  } catch (err) {
    explainError("verify (conexión/login)", err);
  }

  if (!to) {
    console.log("\n(No pasaste un mail de destino, así que no se manda ningún mail de prueba.");
    console.log(" Corré `node test-mail.js tu@mail.com` para además mandar un mail real de prueba.)");
    return;
  }

  console.log(`\n2) Mandando mail de prueba a ${to}...`);
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: "TaDi — mail de prueba",
      html: "<p>Si estás viendo esto, el envío de mails de TaDi está funcionando bien. 🎉</p>",
    });
    console.log("✅ Mail enviado. messageId:", info.messageId);
    console.log("   Revisá la bandeja de entrada (y SPAM) de", to);
  } catch (err) {
    explainError("sendMail (envío)", err);
  }
})();
