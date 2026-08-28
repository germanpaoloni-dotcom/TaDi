// Envío de mails transaccionales (el link de la invitación después de pagar).
//
// MODO DEMO (por defecto): si no hay variables de entorno SMTP cargadas, no
// se manda ningún mail — el flujo sigue funcionando igual, solo que sin el
// mail de respaldo. Esto es a propósito, para no romper nada en desarrollo.
//
// MODO PRODUCCIÓN: definir estas variables de entorno (con Google Workspace,
// que es donde vive administracion@tadi.com.ar, ver instrucciones en el
// README bajo "Mails automáticos"):
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=465
//   SMTP_USER=administracion@tadi.com.ar
//   SMTP_PASS=<contraseña de aplicación de 16 letras, no la contraseña normal>
//   SMTP_FROM=TaDi <administracion@tadi.com.ar>   (opcional, así se muestra el remitente)

const nodemailer = require("nodemailer");

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465, // true para 465 (SSL), false para 587 (STARTTLS)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Varios hostings (Render incluido) no tienen salida IPv6 habilitada:
      // si no forzamos IPv4 acá, Node intenta conectar por IPv6 (porque
      // smtp.gmail.com también publica un registro AAAA), la conexión
      // nunca sale y termina en ENETUNREACH. Forzando family:4 se evita
      // ese intento y conecta directo por IPv4.
      family: 4,
      // Sin esto, si algo anda mal con la conexión SMTP (credenciales
      // vencidas, firewall, lo que sea), nodemailer puede quedarse colgado
      // varios minutos intentando conectar — y como el envío del mail
      // corría "en línea" con el guardado del editor, el botón "¡Listo!"
      // se quedaba trabado en "Guardando…" para siempre. Con estos límites,
      // si el mail falla, falla rápido (y ya no bloquea nada: ver server.js).
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }
  return transporter;
}

// Mail con el link de edición (para el comprador, justo después de pagar) y
// el link público (para que lo comparta apenas termine de personalizarla).
async function sendInvitationLinkEmail({ to, nombreEvento, designName, editUrl, publicUrl }) {
  if (!isConfigured()) {
    console.log("[mailer] SMTP no configurado — se omite el envío del mail con el link (modo demo).");
    return { skipped: true };
  }
  if (!to) {
    console.warn("[mailer] No hay email de destino, no se puede enviar el link.");
    return { skipped: true };
  }

  const subject = "Tus links están listos";
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#33363f;background:#eaeef2;padding:28px 22px;">
      <p style="font-size:.72rem;font-weight:bold;letter-spacing:.5px;color:#ff7a3d;text-transform:uppercase;margin:0 0 6px;">TaDi</p>
      <h2 style="color:#111;margin:0 0 6px;">¡Tus links ya están listos! 🎉</h2>
      <p style="margin:0 0 24px;color:#555;">Guardá este mail: acá vas a tener siempre a mano los dos links de tu invitación
      "${designName || "TaDi"}", aunque cierres la pestaña o pase el tiempo.</p>

      <div style="background:#ffffff;border:1px solid #e2e6eb;border-radius:14px;padding:18px 20px;margin-bottom:16px;">
        <p style="margin:0 0 4px;font-weight:bold;color:#111;">✏️ Link para editar tu invitación</p>
        <p style="margin:0 0 14px;font-size:.85rem;color:#666;">Usalo cuando quieras cambiar nombres, fecha, lugar, fotos o
        cualquier otro dato. Es privado — no lo compartas con tus invitados.</p>
        <p style="margin:0 0 10px;">
          <a href="${editUrl}" style="background:#ff7a3d;color:#fff;text-decoration:none;
            padding:12px 22px;border-radius:10px;font-weight:bold;display:inline-block;font-size:.9rem;">
            Editar mi invitación
          </a>
        </p>
        <p style="font-size:.78rem;color:#8a8f99;word-break:break-all;margin:0;">${editUrl}</p>
      </div>

      ${publicUrl ? `
      <div style="background:#ffffff;border:1px solid #e2e6eb;border-radius:14px;padding:18px 20px;margin-bottom:16px;">
        <p style="margin:0 0 4px;font-weight:bold;color:#111;">🔗 Link para compartir con tus invitados</p>
        <p style="margin:0 0 14px;font-size:.85rem;color:#666;">Este es el que le mandás a la gente que invitás — ahí van a
        poder ver la invitación online y confirmar asistencia.</p>
        <p style="margin:0 0 10px;">
          <a href="${publicUrl}" style="background:#ffffff;color:#33363f;text-decoration:none;border:1px solid #d8dce2;
            padding:11px 22px;border-radius:10px;font-weight:bold;display:inline-block;font-size:.9rem;">
            Ver invitación
          </a>
        </p>
        <p style="font-size:.78rem;color:#8a8f99;word-break:break-all;margin:0;">${publicUrl}</p>
      </div>
      ` : ""}

      <hr style="border:0;border-top:1px solid #dde1e7;margin:28px 0 16px;">
      <p style="font-size:.8rem;color:#999;margin:0;">TaDi — Invitaciones digitales · tadi.com.ar</p>
    </div>
  `;

  return getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

module.exports = { isConfigured, sendInvitationLinkEmail };
