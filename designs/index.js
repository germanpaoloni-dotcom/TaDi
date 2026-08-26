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
    id: "cumpleanos",
    label: "Cumpleaños",
    description: "Invitaciones para cumpleaños de adultos y fiestas de 15+1.",
    ghost: "A CELEBRAR",
    kicker: "Para quién es",
    heroBody: "Para el cumpleaños que se festeja en grande: brindis, buena música y una invitación con la misma onda de la fiesta, con confirmación de asistencia incluida.",
    heroImage: "/static/img/categorias/cumpleanos.png",
    flagshipDesign: "cum-gala-dorada",
  },
  {
    id: "bautismos",
    label: "Bautismos",
    description: "Invitaciones para bautismos y ceremonias religiosas.",
    ghost: "BAUTISMOS",
    kicker: "Para quién es",
    heroBody: "Para la familia que quiere compartir un bautismo con una invitación cálida y sencilla: datos de la ceremonia, la fiesta después y confirmación de asistencia.",
    heroImage: "/static/img/categorias/bautismos.png",
    flagshipDesign: "bau-clasica-dorada",
  },
  {
    id: "despedidas",
    label: "Despedidas de Soltero/a",
    description: "Invitaciones para despedidas de soltero y soltera.",
    ghost: "LA ÚLTIMA",
    kicker: "Para quién es",
    heroBody: "Para organizar la despedida sin grupo de WhatsApp interminable: una invitación con el plan, el lugar y confirmación de quién va, todo en un link.",
    heroImage: "/static/img/categorias/despedidas.png",
    flagshipDesign: "desp-tropical-fiesta",
  },
];

const designs = [
  require("./bodas/elegante-clasica"),
  require("./bodas/boho-naturaleza"),
  require("./bodas/moderna-minimal"),
  require("./bodas/romantica-jardin"),
  require("./bodas/nocturna-glamour"),
  require("./xv/glam-rosa"),
  require("./xv/bohemio-floral"),
  require("./xv/pop-vibrante"),
  require("./xv/elegante-perlas"),
  require("./xv/neon-fiesta"),
  require("./cumpleanos/gala-dorada"),
  require("./cumpleanos/disco-retro"),
  require("./cumpleanos/jardin-atardecer"),
  require("./cumpleanos/rooftop-nocturno"),
  require("./cumpleanos/tropical-sunset"),
  require("./cumpleanos/neon-y2k"),
  require("./infantiles/superheroes"),
  require("./infantiles/princesas"),
  require("./infantiles/safari-aventura"),
  require("./infantiles/espacial"),
  require("./infantiles/dinosaurios"),
  require("./infantiles/futbol"),
  require("./bautismos/clasica-dorada"),
  require("./bautismos/celeste-angelical"),
  require("./bautismos/campestre-botanico"),
  require("./bautismos/moderno-minimal"),
  require("./bautismos/realeza-rosa"),
  require("./despedidas/tropical-fiesta"),
  require("./despedidas/noche-rockera"),
  require("./despedidas/vegas-casino"),
  require("./despedidas/champagne-chic"),
  require("./despedidas/boho-ultima-fiesta"),
];

function getDesign(id) {
  return designs.find((d) => d.id === id);
}

function designsByCategory(catId) {
  return designs.filter((d) => d.category === catId);
}

module.exports = { categories, designs, getDesign, designsByCategory };
