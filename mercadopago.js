// Integración con Mercado Pago (Checkout Pro).
//
// MODO DEMO (por defecto en este prototipo): si no hay MP_ACCESS_TOKEN
// configurado como variable de entorno, no se llama a la API real de
// Mercado Pago: se simula un pago aprobado al instante para poder
// probar todo el flujo (elegir diseño → pagar → editar) sin necesidad
// de una cuenta de Mercado Pago real.
//
// MODO PRODUCCIÓN: definir las variables de entorno
//   MP_ACCESS_TOKEN=APP_USR-xxxxxxxx   (Access Token de la cuenta, en Producción)
//   PUBLIC_BASE_URL=https://tudominio.com
// y este mismo código crea una preferencia real de Checkout Pro y
// redirige al checkout de Mercado Pago.

const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

function isConfigured() {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

function getClient() {
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
}

// Crea una preferencia de pago real y devuelve la URL de checkout (init_point).
async function createPreference({ orderId, title, unitPrice, baseUrl }) {
  const client = getClient();
  const preference = new Preference(client);
  const result = await preference.create({
    body: {
      items: [
        {
          id: orderId,
          title,
          quantity: 1,
          unit_price: Number(unitPrice),
          currency_id: "ARS",
        },
      ],
      external_reference: orderId,
      back_urls: {
        success: `${baseUrl}/pago-exitoso?order=${orderId}`,
        pending: `${baseUrl}/pago-pendiente?order=${orderId}`,
        failure: `${baseUrl}/pago-fallido?order=${orderId}`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/webhook/mercadopago`,
    },
  });
  return result.init_point;
}

// Verifica el estado real de un pago contra la API de Mercado Pago
// (se usa desde el webhook / la vuelta del checkout, para no confiar
// nunca solo en los parámetros de la URL).
async function getPaymentStatus(paymentId) {
  const client = getClient();
  const payment = new Payment(client);
  const result = await payment.get({ id: paymentId });
  return result.status; // 'approved' | 'pending' | 'rejected' | ...
}

module.exports = { isConfigured, createPreference, getPaymentStatus };
