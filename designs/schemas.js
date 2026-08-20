// Definición de los campos que el editor muestra después del pago,
// por categoría. Cada diseño puede usar el esquema base tal cual o
// agregar/quitar campos propios.

const bodaSchema = [
  { name: "novia", label: "Nombre de la novia", type: "text", required: true },
  { name: "novio", label: "Nombre del novio", type: "text", required: true },
  { name: "fecha", label: "Fecha del casamiento", type: "date", required: true },
  { name: "horaCeremonia", label: "Hora de la ceremonia", type: "time" },
  { name: "lugarCeremonia", label: "Lugar de la ceremonia", type: "text" },
  { name: "horaFiesta", label: "Hora de la fiesta", type: "time" },
  { name: "lugarFiesta", label: "Lugar de la fiesta", type: "text" },
  { name: "direccionMapa", label: "Link de Google Maps", type: "url" },
  { name: "mensaje", label: "Mensaje / frase para los invitados", type: "textarea" },
  { name: "dressCode", label: "Código de vestimenta", type: "text" },
  { name: "alias", label: "Alias / CBU para regalo", type: "text" },
  { name: "whatsapp", label: "WhatsApp para RSVP (código país + número)", type: "text" },
  { name: "coverImage", label: "Foto de portada", type: "image" },
  { name: "galeria", label: "Galería de fotos", type: "images" },
];

const xvSchema = [
  { name: "nombre", label: "Nombre de la quinceañera", type: "text", required: true },
  { name: "fecha", label: "Fecha de la fiesta", type: "date", required: true },
  { name: "horaCeremonia", label: "Hora de la ceremonia (opcional)", type: "time" },
  { name: "lugarCeremonia", label: "Lugar de la ceremonia (opcional)", type: "text" },
  { name: "horaFiesta", label: "Hora de la fiesta", type: "time" },
  { name: "lugarFiesta", label: "Lugar de la fiesta", type: "text" },
  { name: "direccionMapa", label: "Link de Google Maps", type: "url" },
  { name: "padres", label: "Padres", type: "text" },
  { name: "mensaje", label: "Mensaje para los invitados", type: "textarea" },
  { name: "dressCode", label: "Código de vestimenta", type: "text" },
  { name: "whatsapp", label: "WhatsApp para RSVP", type: "text" },
  { name: "coverImage", label: "Foto de portada", type: "image" },
  { name: "galeria", label: "Galería de fotos", type: "images" },
];

const empresarialSchema = [
  { name: "nombreEvento", label: "Nombre del evento", type: "text", required: true },
  { name: "empresa", label: "Empresa organizadora", type: "text" },
  { name: "fecha", label: "Fecha del evento", type: "date", required: true },
  { name: "hora", label: "Hora de inicio", type: "time" },
  { name: "lugar", label: "Lugar / sede", type: "text" },
  { name: "direccionMapa", label: "Link de Google Maps", type: "url" },
  { name: "descripcion", label: "Descripción del evento", type: "textarea" },
  { name: "agenda", label: "Agenda (una línea por ítem: hora - actividad)", type: "textarea" },
  { name: "oradores", label: "Oradores (uno por línea: nombre - cargo)", type: "textarea" },
  { name: "dressCode", label: "Código de vestimenta", type: "text" },
  { name: "contacto", label: "Contacto / WhatsApp de registro", type: "text" },
  {
    name: "logo",
    label: "Logo de tu empresa",
    type: "image",
    help: "Subilo en formato PNG con fondo transparente para que se vea prolijo sobre el diseño (no como un cuadrado blanco/de color). Si tu logo no tiene el fondo transparente, podés sacárselo gratis en remove.bg: subís la imagen, descargás el resultado en PNG y lo cargás acá.",
  },
  { name: "colorPalette", label: "Gama de colores", type: "palette" },
  { name: "coverImage", label: "Imagen de portada", type: "image" },
  { name: "galeria", label: "Galería / sponsors", type: "images" },
];

const infantilSchema = [
  { name: "nombreChico", label: "Nombre del cumpleañero/a", type: "text", required: true },
  { name: "edad", label: "Edad que cumple", type: "text", required: true },
  { name: "fecha", label: "Fecha de la fiesta", type: "date", required: true },
  { name: "hora", label: "Hora", type: "time" },
  { name: "lugar", label: "Lugar", type: "text" },
  { name: "direccionMapa", label: "Link de Google Maps", type: "url" },
  { name: "mensaje", label: "Mensaje para los invitados", type: "textarea" },
  { name: "tematica", label: "Temática / disfraz sugerido (opcional)", type: "text" },
  { name: "whatsapp", label: "WhatsApp para RSVP (código país + número)", type: "text" },
  { name: "coverImage", label: "Foto de portada", type: "image" },
  { name: "galeria", label: "Galería de fotos", type: "images" },
];

const bautismoSchema = [
  { name: "nombreChico", label: "Nombre del bautizado/a", type: "text", required: true },
  { name: "padres", label: "Padres", type: "text" },
  { name: "padrinos", label: "Padrinos", type: "text" },
  { name: "fecha", label: "Fecha", type: "date", required: true },
  { name: "horaCeremonia", label: "Hora de la ceremonia", type: "time" },
  { name: "lugarCeremonia", label: "Lugar de la ceremonia", type: "text" },
  { name: "horaFiesta", label: "Hora de la fiesta (opcional)", type: "time" },
  { name: "lugarFiesta", label: "Lugar de la fiesta (opcional)", type: "text" },
  { name: "direccionMapa", label: "Link de Google Maps", type: "url" },
  { name: "mensaje", label: "Mensaje para los invitados", type: "textarea" },
  { name: "whatsapp", label: "WhatsApp para RSVP", type: "text" },
  { name: "coverImage", label: "Foto de portada", type: "image" },
  { name: "galeria", label: "Galería de fotos", type: "images" },
];

const despedidaSchema = [
  { name: "nombre", label: "Nombre de quien se despide de soltero/a", type: "text", required: true },
  { name: "fecha", label: "Fecha", type: "date", required: true },
  { name: "hora", label: "Hora de encuentro", type: "time" },
  { name: "lugar", label: "Lugar / punto de encuentro", type: "text" },
  { name: "direccionMapa", label: "Link de Google Maps", type: "url" },
  { name: "plan", label: "El plan (qué van a hacer)", type: "textarea" },
  { name: "dressCode", label: "Código de vestimenta / consigna", type: "text" },
  { name: "organizadores", label: "Organiza (nombre de quien organiza)", type: "text" },
  { name: "whatsapp", label: "WhatsApp para confirmar", type: "text" },
  { name: "coverImage", label: "Foto de portada", type: "image" },
  { name: "galeria", label: "Galería de fotos", type: "images" },
];

module.exports = { bodaSchema, xvSchema, empresarialSchema, infantilSchema, bautismoSchema, despedidaSchema };
