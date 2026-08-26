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

  const subject = `Tu invitación de TaDi está lista${nombreEvento ? ` — ${nombreEvento}` : ""}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#222;">
      <h2 style="color:#111;">¡Ya podés personalizar tu invitación! 🎉</h2>
      <p>Guardá este mail — acá vas a encontrar siempre el link para seguir editando tu invitación
      "${designName || "TaDi"}", aunque cierres la pestaña o pase el tiempo.</p>
      <p style="margin:28px 0;">
        <a href="${editUrl}" style="background:#ff7a3d;color:#fff;text-decoration:none;
          padding:14px 26px;border-radius:10px;font-weight:bold;display:inline-block;">
          Editar mi invitación
        </a>
      </p>
      <p style="font-size:.85rem;color:#666;word-break:break-all;">O copiá y pegá este link: ${editUrl}</p>
      ${publicUrl ? `
      <p>Una vez que termines de cargar los datos, este es el link que vas a compartir con tus invitados:</p>
      <p style="font-size:.85rem;color:#666;word-break:break-all;">${publicUrl}</p>
      ` : ""}
      <hr style="border:0;border-top:1px solid #eee;margin:28px 0;">
      <p style="font-size:.8rem;color:#999;">TaDi — Invitaciones digitales · tadi.com.ar</p>
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
