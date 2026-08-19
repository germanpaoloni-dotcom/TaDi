// Catálogo de diseños. Para sumar un diseño nuevo con el tiempo:
// 1) crear un archivo en designs/<categoria>/<nuevo-diseño>.js siguiendo
//    el mismo formato que los existentes (id, category, name, summary,
//    accent, schema, sampleData, render).
// 2) agregarlo a la lista de abajo (o, si se prefiere, autocargar toda
//    la carpeta con fs.readdirSync — se deja explícito por claridad).
const categories = [
  {
    id: "bodas",
    label: "Bodas",
    description: "Invitaciones para ceremonia y fiesta de casamiento.",
    ghost: "PARA SIEMPRE",
    kicker: "Para quién es",
    heroBody: "Para la pareja que quiere una invitación que se sienta tan cuidada como la boda misma: cronograma, mapa, mesa de regalos y confirmación de asistencia, todo en un link.",
    heroImage: "/static/img/categorias/bodas.png",
    flagshipDesign: "boda-elegante-clasica",
  },
  {
    id: "xv",
    label: "Quince Años",
    description: "Invitaciones para quinceañeras.",
    ghost: "MIS QUINCE",
    kicker: "Para quién es",
    heroBody: "Para la quinceañera que quiere algo distinto a una tarjeta de cartulina: fotos, cuenta regresiva, música y una invitación que sus amigas van a querer abrir.",
    heroImage: "/static/img/categorias/xv.png",
    flagshipDesign: "xv-glam-rosa",
  },
  {
    id: "infantiles",
    label: "Fiestas Infantiles",
    description: "Invitaciones para cumpleaños infantiles.",
    ghost: "A JUGAR",
    kicker: "Para quién es",
    heroBody: "Para el cumpleaños de los más chicos: colores, personajes y una invitación tan divertida como la fiesta, con RSVP para que los papás confirmen fácil.",
    heroImage: "/static/img/categorias/infantiles.png",
    flagshipDesign: "inf-superheroes",
  },
  {
    id: "bautismos",
    label: "Bautismos",
    description: "Invitaciones para bautismos y ceremonias religiosas.",
    ghost: "BAUTISMOS",
    kicker: "Para quién es",
    heroBody: "Para la familia que quiere compartir un bautismo con una invitación cálida y sencilla: datos de la ceremonia, la fiesta después y confirmación de asistencia.",
    heroImage: "/static/img/categorias/bautismos.png",
    flagshipDesign: null,
  },
  {
    id: "empresariales",
    label: "Eventos empresariales",
    description: "Conferencias, lanzamientos y aniversarios de empresa.",
    ghost: "TU EVENTO",
    kicker: "Para quién es",
    heroBody: "Para la empresa que organiza una conferencia, un lanzamiento o un aniversario y necesita una invitación con agenda, oradores y registro de asistentes, con tu marca.",
    heroImage: "/static/img/categorias/empresariales.png",
    flagshipDesign: "emp-conferencia-corporativa",
  },
  {
    id: "despedidas",
    label: "Despedidas de Soltero/a",
    description: "Invitaciones para despedidas de soltero y soltera.",
    ghost: "LA ÚLTIMA",
    kicker: "Para quién es",
    heroBody: "Para organizar la despedida sin grupo de WhatsApp interminable: una invitación con el plan, el lugar y confirmación de quién va, todo en un link.",
    heroImage: "/static/img/categorias/despedidas.png",
    flagshipDesign: null,
  },
];

const designs = [
  require("./bodas/elegante-clasica"),
  require("./bodas/boho-naturaleza"),
  require("./bodas/moderna-minimal"),
  require("./xv/glam-rosa"),
  require("./xv/bohemio-floral"),
  require("./xv/pop-vibrante"),
  require("./empresariales/conferencia-corporativa"),
  require("./empresariales/lanzamiento-producto"),
  require("./empresariales/gala-aniversario"),
  require("./infantiles/superheroes"),
  require("./infantiles/princesas"),
  require("./infantiles/safari-aventura"),
  require("./infantiles/espacial"),
  require("./infantiles/dinosaurios"),
];

function getDesign(id) {
  return designs.find((d) => d.id === id);
}

function designsByCategory(catId) {
  return designs.filter((d) => d.category === catId);
}

module.exports = { categories, designs, getDesign, designsByCategory };
