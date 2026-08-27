// Catálogo de diseños. Para sumar un diseño nuevo con el tiempo:
// 1) crear un archivo en designs/<categoria>/<nuevo-diseño>.js siguiendo
//    el mismo formato que los existentes (id, category, name, summary,
//    accent, schema, sampleData, render).
// 2) agregarlo a la lista de abajo (o, si se prefiere, autocargar toda
//    la carpeta con fs.readdirSync — se deja explícito por claridad).
//
// Orden de "categories": es el orden en que se muestran en el nav, el
// home y el filtro del catálogo — se puede reordenar libremente, no
// afecta nada más.
//
// Categorías de temporada (Halloween, Navidad): llevan un campo `season`
// ({ startMonth, startDay, endMonth, endDay }) que las oculta del nav, el
// home y el filtro del catálogo fuera de esas fechas — ver
// `isCategoryInSeason` / `visibleCategories` más abajo. Por link directo
// (o desde el picker de "cambiar diseño") siguen siendo accesibles todo
// el año, para poder compartirlas de antemano o revisarlas en cualquier
// momento.
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
    id: "savethedate",
    label: "Save the Date",
    description: "El anticipo de la boda: la fecha agendada mientras llega la invitación formal.",
    ghost: "ANOTALO",
    kicker: "Para quién es",
    heroBody: "Para la pareja que ya tiene fecha y quiere avisar antes que nadie: un link lindo para agendar la fecha, mientras la invitación con todos los detalles llega más adelante.",
    heroImage: "/static/img/categorias/savethedate.png",
    flagshipDesign: "std-elegante-clasico",
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
    id: "halloween",
    label: "Halloween",
    description: "Invitaciones para fiestas de Halloween.",
    ghost: "TRICK OR TREAT",
    kicker: "Para quién es",
    heroBody: "Para la fiesta de Halloween que se festeja con disfraz obligatorio: una invitación con la onda justa de misterio y diversión, lista para compartir.",
    heroImage: "/static/img/categorias/halloween.png",
    flagshipDesign: "hall-noche-embrujada",
    // TESTING: temporalmente visible todo el año a pedido del cliente,
    // mientras el sitio está en pruebas. Restaurar cuando avise que el
    // sitio está listo para lanzar:
    // season: { startMonth: 10, startDay: 1, endMonth: 10, endDay: 31 },
  },
  {
    id: "navidad",
    label: "Navidad",
    description: "Invitaciones para cenas y festejos de Navidad.",
    ghost: "FELIZ NAVIDAD",
    kicker: "Para quién es",
    heroBody: "Para la cena de Navidad, el amigo invisible o el brindis de fin de año: una invitación cálida y festiva con todos los datos para que nadie falte.",
    heroImage: "/static/img/categorias/navidad.png",
    flagshipDesign: "nav-clasica-dorada",
    // TESTING: temporalmente visible todo el año a pedido del cliente,
    // mientras el sitio está en pruebas. Restaurar cuando avise que el
    // sitio está listo para lanzar:
    // season: { startMonth: 11, startDay: 25, endMonth: 12, endDay: 25 },
  },
];

// true si la categoría está "en temporada" ahora mismo (o si no tiene
// restricción de temporada, en cuyo caso siempre es visible).
function isCategoryInSeason(cat, now = new Date()) {
  if (!cat.season) return true;
  const { startMonth, startDay, endMonth, endDay } = cat.season;
  const cur = (now.getMonth() + 1) * 100 + now.getDate();
  const start = startMonth * 100 + startDay;
  const end = endMonth * 100 + endDay;
  return start <= end ? cur >= start && cur <= end : cur >= start || cur <= end;
}

// Categorías a mostrar en nav / home / filtro del catálogo: todas las
// que no tienen temporada, más las de temporada sólo cuando corresponde.
function visibleCategories(now = new Date()) {
  return categories.filter((c) => isCategoryInSeason(c, now));
}

const designs = [
  require("./bodas/elegante-clasica"),
  require("./bodas/boho-naturaleza"),
  require("./bodas/moderna-minimal"),
  require("./bodas/romantica-jardin"),
  require("./bodas/nocturna-glamour"),
  require("./bodas/art-deco-gatsby"),
  require("./bodas/rustica-campo"),
  require("./bodas/destino-playa"),
  require("./bodas/invierno-nevado"),
  require("./bodas/boho-desertica"),
  require("./savethedate/elegante-clasico"),
  require("./savethedate/boho-natural"),
  require("./savethedate/art-deco"),
  require("./savethedate/glamour-nocturno"),
  require("./savethedate/boho-desertica"),
  require("./savethedate/destino-playa"),
  require("./savethedate/invierno-nevado"),
  require("./savethedate/moderna-minimal"),
  require("./savethedate/romantica-jardin"),
  require("./savethedate/rustica-campo"),
  require("./infantiles/superheroes"),
  require("./infantiles/princesas"),
  require("./infantiles/safari-aventura"),
  require("./infantiles/espacial"),
  require("./infantiles/dinosaurios"),
  require("./infantiles/futbol"),
  require("./infantiles/piratas-tesoro"),
  require("./infantiles/unicornio-magico"),
  require("./infantiles/circo-magico"),
  require("./infantiles/granja-animalitos"),
  require("./xv/glam-rosa"),
  require("./xv/bohemio-floral"),
  require("./xv/pop-vibrante"),
  require("./xv/elegante-perlas"),
  require("./xv/neon-fiesta"),
  require("./xv/fiesta-serpentinas"),
  require("./xv/cristal-nocturno"),
  require("./xv/jardin-encantado"),
  require("./xv/realeza-dorada"),
  require("./xv/mariposas-atardecer"),
  require("./cumpleanos/gala-dorada"),
  require("./cumpleanos/disco-retro"),
  require("./cumpleanos/jardin-atardecer"),
  require("./cumpleanos/rooftop-nocturno"),
  require("./cumpleanos/tropical-sunset"),
  require("./cumpleanos/neon-y2k"),
  require("./bautismos/clasica-dorada"),
  require("./bautismos/celeste-angelical"),
  require("./bautismos/campestre-botanico"),
  require("./bautismos/moderno-minimal"),
  require("./bautismos/realeza-rosa"),
  require("./halloween/noche-embrujada"),
  require("./halloween/dulce-o-truco"),
  require("./halloween/cementerio-elegante"),
  require("./navidad/clasica-dorada"),
  require("./navidad/nordica-nevada"),
  require("./navidad/luces-festivas"),
];

function getDesign(id) {
  return designs.find((d) => d.id === id);
}

function designsByCategory(catId) {
  return designs.filter((d) => d.category === catId);
}

module.exports = { categories, designs, getDesign, designsByCategory, isCategoryInSeason, visibleCategories };
