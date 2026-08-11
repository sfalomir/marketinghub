import type { KeyDate, KeyDateType, ObservanceScope } from "./mh-types";

type Fixed = {
  name: string;
  m: number;
  d: number;
  type: KeyDateType;
  scope: ObservanceScope;
  desc: string;
  lead?: number;
};

type Movable = {
  name: string;
  type: KeyDateType;
  scope: ObservanceScope;
  desc: string;
  lead?: number;
} & (
  | { rule: "nth-dow"; m: number; nth: number; dow: number }
  | { rule: "easter"; offset: number }
  | { rule: "doy"; doy: number }
);

const FIXED: Fixed[] = [
  // Festivos México e internacionales
  { name: "Año Nuevo", m: 1, d: 1, type: "Día festivo", scope: "Internacional", desc: "Inicio del año civil. Campañas de propósitos, ofertas de arranque y recap anual.", lead: 14 },
  { name: "Día de Reyes", m: 1, d: 6, type: "Día cultural", scope: "México", desc: "Rosca de Reyes y tradición familiar. Ideal para retail, alimentos y contenidos locales." },
  { name: "Día de la Constitución (fecha histórica)", m: 2, d: 5, type: "Día festivo", scope: "México", desc: "Promulgación de la Constitución de 1917. Contenido cívico e institucional." },
  { name: "Día de la Bandera", m: 2, d: 24, type: "Día festivo", scope: "México", desc: "Ceremonia cívica nacional. Piezas institucionales y educativas." },
  { name: "Natalicio de Benito Juárez (fecha histórica)", m: 3, d: 21, type: "Día festivo", scope: "México", desc: "Natalicio del Benemérito de las Américas. Contenido histórico y de valores." },
  { name: "Expropiación Petrolera", m: 3, d: 18, type: "Día festivo", scope: "México", desc: "Aniversario de 1938. Piezas de memoria histórica y soberanía." },
  { name: "Día del Trabajo", m: 5, d: 1, type: "Día festivo", scope: "Internacional", desc: "Descanso obligatorio. Campañas de bienestar laboral, employer branding y retail.", lead: 14 },
  { name: "Batalla de Puebla / Cinco de Mayo", m: 5, d: 5, type: "Día festivo", scope: "México", desc: "Victoria de 1862. En México es cívico; en EE.UU. es fecha cultural de gran alcance." },
  { name: "Natalicio de Miguel Hidalgo", m: 5, d: 8, type: "Día festivo", scope: "México", desc: "Padre de la Patria. Contenido histórico escolar e institucional." },
  { name: "Día de la Marina", m: 6, d: 1, type: "Día festivo", scope: "México", desc: "Homenaje a la Armada de México. Contenido cívico y de costa." },
  { name: "Día del Ingeniero", m: 7, d: 1, type: "Día tecnológico", scope: "México", desc: "Reconocimiento a la ingeniería. B2B, STEM y employer branding técnico." },
  { name: "Niños Héroes", m: 9, d: 13, type: "Día festivo", scope: "México", desc: "Defensa del Castillo de Chapultepec. Contenido cívico escolar." },
  { name: "Grito de Independencia", m: 9, d: 15, type: "Día festivo", scope: "México", desc: "Noche del Grito. Activaciones patrias, retail y foodservice.", lead: 21 },
  { name: "Independencia de México", m: 9, d: 16, type: "Día festivo", scope: "México", desc: "Fiesta nacional y descanso oficial. Campaña patria de alto impacto.", lead: 21 },
  { name: "Día de la Raza", m: 10, d: 12, type: "Día cultural", scope: "México", desc: "Encuentro de culturas. Contenido de identidad, diversidad e hispanidad." },
  { name: "Día de Muertos", m: 11, d: 2, type: "Día cultural", scope: "México", desc: "Tradición mexicana de alto valor de marca. Altares, diseño y turismo cultural.", lead: 21 },
  { name: "Revolución Mexicana (fecha histórica)", m: 11, d: 20, type: "Día festivo", scope: "México", desc: "Inicio de la Revolución de 1910. Contenido cívico e histórico." },
  { name: "Virgen de Guadalupe", m: 12, d: 12, type: "Día cultural", scope: "México", desc: "Festividad religiosa de gran arraigo. Retail, peregrinaciones y comunidad.", lead: 10 },
  { name: "Inicio de las Posadas", m: 12, d: 16, type: "Día cultural", scope: "México", desc: "Arranque de las posadas navideñas. Campañas decembrinas y consumo.", lead: 14 },
  { name: "Nochebuena", m: 12, d: 24, type: "Día festivo", scope: "México", desc: "Cena familiar. Retail de último momento y contenidos emotivos." },
  { name: "Navidad", m: 12, d: 25, type: "Día festivo", scope: "Internacional", desc: "Festividad global. Campañas de regalo, cierre de año y propósito.", lead: 30 },
  { name: "Día de los Santos Inocentes", m: 12, d: 28, type: "Día cultural", scope: "México", desc: "Bromas tradicionales. Contenido ligero y de engagement." },
  { name: "Fin de año", m: 12, d: 31, type: "Día festivo", scope: "Internacional", desc: "Cierre anual. Recaps, agradecimientos y preventa del año nuevo.", lead: 14 },

  // Culturales
  { name: "Día de la Candelaria", m: 2, d: 2, type: "Día cultural", scope: "México", desc: "Tamales y tradición. Alimentos, recetas y comunidad." },
  { name: "Día Internacional de la Educación", m: 1, d: 24, type: "Día cultural", scope: "Internacional", desc: "ONU. Contenido educativo, edtech y responsabilidad social." },
  { name: "Día Internacional de Conmemoración del Holocausto", m: 1, d: 27, type: "Día cultural", scope: "Internacional", desc: "Memoria histórica. Piezas institucionales de respeto y derechos humanos." },
  { name: "Día Internacional de la Lengua Materna", m: 2, d: 21, type: "Día cultural", scope: "Internacional", desc: "UNESCO. Lenguas indígenas, diversidad lingüística y cultura local." },
  { name: "Día de la Cero Discriminación", m: 3, d: 1, type: "Día cultural", scope: "Internacional", desc: "ONUSIDA. Inclusión, diversidad y marcas con propósito." },
  { name: "Día Internacional de la Felicidad", m: 3, d: 20, type: "Día cultural", scope: "Internacional", desc: "ONU. Contenido positivo, bienestar y employer branding." },
  { name: "Día de la Lengua Francesa", m: 3, d: 20, type: "Día cultural", scope: "Internacional", desc: "ONU. Cultura francófona, educación y turismo." },
  { name: "Día Mundial de la Poesía", m: 3, d: 21, type: "Día cultural", scope: "Internacional", desc: "UNESCO. Editorial, librerías y contenidos creativos." },
  { name: "Día Internacional de los Bosques", m: 3, d: 21, type: "Día cultural", scope: "Internacional", desc: "Sostenibilidad, RSE y marcas verdes." },
  { name: "Día Internacional de la Eliminación de la Discriminación Racial", m: 3, d: 21, type: "Día cultural", scope: "Internacional", desc: "ONU. Diversidad, inclusión y comunicación responsable." },
  { name: "Día Mundial del Agua", m: 3, d: 22, type: "Día cultural", scope: "Internacional", desc: "ONU. Campañas de cuidado del agua y sostenibilidad." },
  { name: "Día Mundial del Teatro", m: 3, d: 27, type: "Día cultural", scope: "Internacional", desc: "Artes escénicas. Cultura, tickets y patrocinios." },
  { name: "Día Mundial de la Vida Silvestre", m: 3, d: 3, type: "Día cultural", scope: "Internacional", desc: "ONU. Biodiversidad y RSE ambiental." },
  { name: "Día Mundial de la Salud", m: 4, d: 7, type: "Día cultural", scope: "Internacional", desc: "OMS. Salud, bienestar y marcas de cuidado." },
  { name: "Día Mundial del Arte", m: 4, d: 15, type: "Día cultural", scope: "Internacional", desc: "UNESCO. Creatividad, museos y diseño." },
  { name: "Día Internacional de los Monumentos y Sitios", m: 4, d: 18, type: "Día cultural", scope: "Internacional", desc: "Patrimonio. Turismo cultural y destinos." },
  { name: "Día de la Tierra", m: 4, d: 22, type: "Día cultural", scope: "Internacional", desc: "Sostenibilidad. Activaciones verdes y propósito ambiental.", lead: 10 },
  { name: "Día del Libro y de la Lengua Española", m: 4, d: 23, type: "Día cultural", scope: "Internacional", desc: "UNESCO / Cervantes. Editorial, librerías y contenidos en español." },
  { name: "Día Internacional del Jazz", m: 4, d: 30, type: "Día cultural", scope: "Internacional", desc: "UNESCO. Música, cultura y eventos." },
  { name: "Día del Niño", m: 4, d: 30, type: "Día cultural", scope: "México", desc: "Celebración infantil en México. Juguetes, familia y retail.", lead: 14 },
  { name: "Día Mundial de la Libertad de Prensa", m: 5, d: 3, type: "Día cultural", scope: "Internacional", desc: "UNESCO. Medios, periodismo y transparencia." },
  { name: "Día Internacional de las Familias", m: 5, d: 15, type: "Día cultural", scope: "Internacional", desc: "ONU. Familia, consumo y contenidos emotivos." },
  { name: "Día del Maestro", m: 5, d: 15, type: "Día cultural", scope: "México", desc: "Homenaje docente. Edtech, regalos y employer branding educativo.", lead: 10 },
  { name: "Día Internacional de los Museos", m: 5, d: 18, type: "Día cultural", scope: "Internacional", desc: "ICOM. Cultura, turismo y experiencias." },
  { name: "Día Mundial de la Diversidad Cultural", m: 5, d: 21, type: "Día cultural", scope: "Internacional", desc: "UNESCO. Inclusión, interculturalidad y marcas globales." },
  { name: "Día Mundial del Medio Ambiente", m: 6, d: 5, type: "Día cultural", scope: "Internacional", desc: "ONU. Campañas verdes de alto alcance.", lead: 10 },
  { name: "Día Mundial de los Océanos", m: 6, d: 8, type: "Día cultural", scope: "Internacional", desc: "ONU. Plásticos, costas y sostenibilidad." },
  { name: "Día Mundial contra el Trabajo Infantil", m: 6, d: 12, type: "Día cultural", scope: "Internacional", desc: "OIT. RSE, derechos y comunicación responsable." },
  { name: "Día Mundial de la Música", m: 6, d: 21, type: "Día cultural", scope: "Internacional", desc: "Festivales, streaming y cultura popular." },
  { name: "Día Internacional del Yoga", m: 6, d: 21, type: "Día cultural", scope: "Internacional", desc: "ONU. Bienestar, fitness y lifestyle." },
  { name: "Día Mundial de la Población", m: 7, d: 11, type: "Día cultural", scope: "Internacional", desc: "UNFPA. Datos demográficos y campañas sociales." },
  { name: "Día Internacional de Nelson Mandela", m: 7, d: 18, type: "Día cultural", scope: "Internacional", desc: "ONU. Justicia, liderazgo y propósito." },
  { name: "Día Internacional de los Pueblos Indígenas", m: 8, d: 9, type: "Día cultural", scope: "Internacional", desc: "ONU. Culturas originarias, México pluricultural y RSE." },
  { name: "Día Internacional de la Juventud", m: 8, d: 12, type: "Día cultural", scope: "Internacional", desc: "ONU. Gen Z, educación y marcas jóvenes." },
  { name: "Día Internacional de la Alfabetización", m: 9, d: 8, type: "Día cultural", scope: "Internacional", desc: "UNESCO. Educación, libros y edtech." },
  { name: "Día Internacional de la Democracia", m: 9, d: 15, type: "Día cultural", scope: "Internacional", desc: "ONU. Ciudadanía y comunicación institucional." },
  { name: "Día Internacional de la Paz", m: 9, d: 21, type: "Día cultural", scope: "Internacional", desc: "ONU. Propósito, comunidad y marcas humanas." },
  { name: "Día Mundial del Turismo", m: 9, d: 27, type: "Día cultural", scope: "Internacional", desc: "OMT. Destinos, hotelería y experiencias." },
  { name: "Día Nacional del Maíz", m: 9, d: 29, type: "Día cultural", scope: "México", desc: "Patrimonio alimentario. Alimentos, campo y identidad mexicana." },
  { name: "Día Internacional de la Traducción", m: 9, d: 30, type: "Día cultural", scope: "Internacional", desc: "Lenguas, localización y contenidos globales." },
  { name: "Día Internacional de las Personas de Edad", m: 10, d: 1, type: "Día cultural", scope: "Internacional", desc: "ONU. Silver economy, salud y familia." },
  { name: "Día Internacional de la No Violencia", m: 10, d: 2, type: "Día cultural", scope: "Internacional", desc: "ONU. Gandhi. Contenido de paz y civismo." },
  { name: "Día Mundial de los Docentes", m: 10, d: 5, type: "Día cultural", scope: "Internacional", desc: "UNESCO. Educación y reconocimiento docente." },
  { name: "Día Mundial de la Alimentación", m: 10, d: 16, type: "Día cultural", scope: "Internacional", desc: "FAO. Alimentos, campo y seguridad alimentaria." },
  { name: "Día Internacional para la Erradicación de la Pobreza", m: 10, d: 17, type: "Día cultural", scope: "Internacional", desc: "ONU. RSE y campañas sociales." },
  { name: "Día de las Naciones Unidas", m: 10, d: 24, type: "Día cultural", scope: "Internacional", desc: "ONU. Cooperación internacional y ciudadanía global." },
  { name: "Día Mundial del Patrimonio Audiovisual", m: 10, d: 27, type: "Día cultural", scope: "Internacional", desc: "UNESCO. Archivo, cine y medios." },
  { name: "Halloween", m: 10, d: 31, type: "Fecha comercial", scope: "Internacional", desc: "Consumo de disfraces y entretenimiento. Retail y contenidos creativos.", lead: 14 },
  { name: "Día de Todos los Santos", m: 11, d: 1, type: "Día cultural", scope: "México", desc: "Víspera de Muertos. Altares, flores y tradición." },
  { name: "Día Universal del Niño", m: 11, d: 20, type: "Día cultural", scope: "Internacional", desc: "ONU. Infancia, derechos y marcas familiares." },
  { name: "Día Mundial del SIDA", m: 12, d: 1, type: "Día cultural", scope: "Internacional", desc: "ONUSIDA. Salud, prevención y destigma." },
  { name: "Día Internacional de las Personas con Discapacidad", m: 12, d: 3, type: "Día cultural", scope: "Internacional", desc: "ONU. Accesibilidad, inclusión y diseño universal." },
  { name: "Día Internacional del Migrante", m: 12, d: 18, type: "Día cultural", scope: "Internacional", desc: "ONU. Diáspora mexicana, remesas y comunidad." },
  { name: "Día de la Lengua Árabe", m: 12, d: 18, type: "Día cultural", scope: "Internacional", desc: "ONU. Diversidad lingüística y cultura." },
  { name: "Día Mundial de los Refugiados", m: 6, d: 20, type: "Día cultural", scope: "Internacional", desc: "ACNUR. Solidaridad y comunicación humanitaria." },
  { name: "Día Internacional de la Caridad", m: 9, d: 5, type: "Día cultural", scope: "Internacional", desc: "ONU. Voluntariado y RSE." },
  { name: "San Juan", m: 6, d: 24, type: "Día cultural", scope: "México", desc: "Tradición de agua y festividades locales." },
  { name: "Santa Cecilia (música)", m: 11, d: 22, type: "Día cultural", scope: "México", desc: "Patrona de la música. Eventos, streaming y cultura popular." },

  // Tecnológicos
  { name: "Día Internacional de la Protección de Datos", m: 1, d: 28, type: "Día tecnológico", scope: "Internacional", desc: "Privacidad, ciberseguridad y confianza digital. Ideal para fintech y SaaS.", lead: 10 },
  { name: "Día Pi", m: 3, d: 14, type: "Día tecnológico", scope: "Internacional", desc: "Cultura STEM. Contenido geek, educación y comunidad tech." },
  { name: "Día Meteorológico Mundial", m: 3, d: 23, type: "Día tecnológico", scope: "Internacional", desc: "OMM. Clima, datos y ciencia." },
  { name: "World Backup Day", m: 3, d: 31, type: "Día tecnológico", scope: "Internacional", desc: "Respaldo de información. Ciberseguridad, nube y tips B2B." },
  { name: "Día de la Cosmonáutica", m: 4, d: 12, type: "Día tecnológico", scope: "Internacional", desc: "Yuri Gagarin. Espacio, STEM y contenidos de innovación." },
  { name: "Día Mundial de la Creatividad y la Innovación", m: 4, d: 21, type: "Día tecnológico", scope: "Internacional", desc: "ONU. Innovación, diseño y cultura de producto." },
  { name: "Día Mundial de la Propiedad Intelectual", m: 4, d: 26, type: "Día tecnológico", scope: "Internacional", desc: "OMPI. Marcas, patentes y economía creativa." },
  { name: "Star Wars Day", m: 5, d: 4, type: "Día tecnológico", scope: "Internacional", desc: "Cultura pop geek. Entretenimiento, fandom y retail." },
  { name: "Día Internacional de la Luz", m: 5, d: 16, type: "Día tecnológico", scope: "Internacional", desc: "UNESCO. Ciencia, fotónica y educación STEM." },
  { name: "Día Mundial de las Telecomunicaciones y la Sociedad de la Información", m: 5, d: 17, type: "Día tecnológico", scope: "Internacional", desc: "UIT. Internet, conectividad y transformación digital.", lead: 10 },
  { name: "Día del Orgullo Friki / Towel Day", m: 5, d: 25, type: "Día tecnológico", scope: "Internacional", desc: "Cultura geek. Comunidad, gaming y entretenimiento." },
  { name: "Día Mundial de las Competencias de la Juventud", m: 7, d: 15, type: "Día tecnológico", scope: "Internacional", desc: "ONU. Talento joven, upskilling y edtech." },
  { name: "Día de la World Wide Web", m: 8, d: 1, type: "Día tecnológico", scope: "Internacional", desc: "Aniversario de la WWW. Internet, producto digital y nostalgia tech." },
  { name: "Día Internacional del Acceso a la Información", m: 9, d: 28, type: "Día tecnológico", scope: "Internacional", desc: "UNESCO. Transparencia, datos abiertos y periodismo." },
  { name: "Inicio de la Semana Mundial del Espacio", m: 10, d: 4, type: "Día tecnológico", scope: "Internacional", desc: "ONU. STEM, satélites y divulgación científica." },
  { name: "Día Mundial del Correo", m: 10, d: 9, type: "Día tecnológico", scope: "Internacional", desc: "UPU. Logística, e-commerce y comunicación." },
  { name: "Día Internacional de Internet", m: 10, d: 29, type: "Día tecnológico", scope: "Internacional", desc: "ARPANET. Conectividad, cultura digital y producto.", lead: 7 },
  { name: "Día Mundial de la Ciencia para la Paz y el Desarrollo", m: 11, d: 10, type: "Día tecnológico", scope: "Internacional", desc: "UNESCO. Ciencia, divulgación y educación." },
  { name: "Día Mundial de la Televisión", m: 11, d: 21, type: "Día tecnológico", scope: "Internacional", desc: "ONU. Medios, streaming y contenido audiovisual." },
  { name: "Día de la Seguridad Informática", m: 11, d: 30, type: "Día tecnológico", scope: "Internacional", desc: "Computer Security Day. Ciberseguridad y tips para usuarios y empresas." },
  { name: "Día Mundial de la Informática", m: 12, d: 2, type: "Día tecnológico", scope: "Internacional", desc: "Alfabetización digital. Capacitaciones, SaaS y educación tech." },
  { name: "Día Internacional contra la Corrupción", m: 12, d: 9, type: "Día cultural", scope: "Internacional", desc: "ONU. Transparencia, compliance y comunicación institucional." },

  // Mujeres
  { name: "Día de la Enfermera", m: 1, d: 6, type: "Mujeres", scope: "México", desc: "México celebra a las enfermeras el 6 de enero. Salud, reconocimiento y employer branding." },
  { name: "Día Internacional de Tolerancia Cero con la Mutilación Genital Femenina", m: 2, d: 6, type: "Mujeres", scope: "Internacional", desc: "ONU. Derechos de niñas y mujeres. Comunicación con cuidado y rigor." },
  { name: "Día Internacional de la Mujer y la Niña en la Ciencia", m: 2, d: 11, type: "Mujeres", scope: "Internacional", desc: "ONU. STEM femenino, talento y diversidad en tecnología.", lead: 14 },
  { name: "Día Internacional de la Mujer", m: 3, d: 8, type: "Mujeres", scope: "Internacional", desc: "Fecha clave de marca. Equidad, liderazgo y campañas con propósito. Evitar tokenismo.", lead: 21 },
  { name: "Paro Nacional de Mujeres", m: 3, d: 9, type: "Mujeres", scope: "México", desc: "Jornada de visibilidad del 9 de marzo en México. Comunicación sensible y de apoyo." },
  { name: "Día de las Madres", m: 5, d: 10, type: "Mujeres", scope: "México", desc: "Una de las fechas comerciales más fuertes del país. Retail, regalos y contenidos emotivos.", lead: 21 },
  { name: "Día Internacional de la Enfermería", m: 5, d: 12, type: "Mujeres", scope: "Internacional", desc: "Florence Nightingale. Salud y reconocimiento profesional." },
  { name: "Día Internacional de Acción por la Salud de las Mujeres", m: 5, d: 28, type: "Mujeres", scope: "Internacional", desc: "Salud sexual y reproductiva. Campañas informativas y de cuidado." },
  { name: "Día Internacional para la Eliminación de la Violencia Sexual en los Conflictos", m: 6, d: 19, type: "Mujeres", scope: "Internacional", desc: "ONU. Derechos humanos y comunicación responsable." },
  { name: "Día Internacional de las Viudas", m: 6, d: 23, type: "Mujeres", scope: "Internacional", desc: "ONU. Protección social y visibilidad." },
  { name: "Día de la Secretaria", m: 7, d: 23, type: "Mujeres", scope: "México", desc: "Fecha laboral mexicana. Reconocimiento de equipos administrativos." },
  { name: "Día Mundial contra la Trata", m: 7, d: 30, type: "Mujeres", scope: "Internacional", desc: "ONU. Prevención, derechos y RSE." },
  { name: "Inicio de la Semana Mundial de la Lactancia", m: 8, d: 1, type: "Mujeres", scope: "Internacional", desc: "OMS. Maternidad, salud y apoyo a lactancia." },
  { name: "Día de la Igualdad de la Mujer", m: 8, d: 26, type: "Mujeres", scope: "Internacional", desc: "Women's Equality Day. Equidad salarial y liderazgo." },
  { name: "Día Internacional de la Igualdad Salarial", m: 9, d: 18, type: "Mujeres", scope: "Internacional", desc: "ONU. Brecha salarial, DEI y employer branding.", lead: 10 },
  { name: "Día por el Derecho a Decidir", m: 9, d: 28, type: "Mujeres", scope: "Internacional", desc: "Salud y derechos reproductivos. Comunicación con criterio y respeto." },
  { name: "Día Internacional de la Niña", m: 10, d: 11, type: "Mujeres", scope: "Internacional", desc: "ONU. Educación, STEM y fin de la violencia contra niñas.", lead: 10 },
  { name: "Día Internacional de las Mujeres Rurales", m: 10, d: 15, type: "Mujeres", scope: "Internacional", desc: "ONU. Campo, economía local y mujeres productoras." },
  { name: "Día Mundial de la Menopausia", m: 10, d: 18, type: "Mujeres", scope: "Internacional", desc: "Salud femenina. Información, destigma y marcas de cuidado." },
  { name: "Día de la Mujer Emprendedora", m: 11, d: 19, type: "Mujeres", scope: "Internacional", desc: "Negocios liderados por mujeres. PyMEs, fintech y liderazgo.", lead: 10 },
  { name: "Día Internacional de la Eliminación de la Violencia contra la Mujer", m: 11, d: 25, type: "Mujeres", scope: "Internacional", desc: "25N. Inicio de los 16 Días de Activismo. Campañas naranja y de prevención.", lead: 14 },
  { name: "Día de los Derechos Humanos", m: 12, d: 10, type: "Mujeres", scope: "Internacional", desc: "Cierre de los 16 Días de Activismo. Derechos, equidad y propósito de marca.", lead: 7 },
  { name: "Día Mundial de los Padres", m: 6, d: 1, type: "Día cultural", scope: "Internacional", desc: "ONU. Crianza, familia y corresponsabilidad." },

  // Comerciales útiles para marketing
  { name: "San Valentín", m: 2, d: 14, type: "Fecha comercial", scope: "Internacional", desc: "Fecha comercial global. Retail, restaurantes y contenidos de pareja.", lead: 21 },
  { name: "Día Mundial de los Derechos del Consumidor", m: 3, d: 15, type: "Fecha comercial", scope: "Internacional", desc: "Confianza, servicio y transparencia de marca." },
];

const NARANJA_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];

const MOVABLE: Movable[] = [
  {
    name: "Día de la Constitución (oficial)",
    type: "Día festivo",
    scope: "México",
    desc: "Primer lunes de febrero. Descanso obligatorio. Planea contenidos cívicos y operaciones.",
    lead: 14,
    rule: "nth-dow",
    m: 2,
    nth: 1,
    dow: 1,
  },
  {
    name: "Safer Internet Day",
    type: "Día tecnológico",
    scope: "Internacional",
    desc: "Segundo martes de febrero. Ciberseguridad, infancia digital y educación en línea.",
    lead: 10,
    rule: "nth-dow",
    m: 2,
    nth: 2,
    dow: 2,
  },
  {
    name: "Natalicio de Benito Juárez (oficial)",
    type: "Día festivo",
    scope: "México",
    desc: "Tercer lunes de marzo. Descanso obligatorio.",
    lead: 14,
    rule: "nth-dow",
    m: 3,
    nth: 3,
    dow: 1,
  },
  {
    name: "Jueves Santo",
    type: "Día festivo",
    scope: "México",
    desc: "Semana Santa. Turismo, retail y contenidos de descanso.",
    lead: 21,
    rule: "easter",
    offset: -3,
  },
  {
    name: "Viernes Santo",
    type: "Día festivo",
    scope: "México",
    desc: "Semana Santa. Alta temporada turística y consumo.",
    lead: 21,
    rule: "easter",
    offset: -2,
  },
  {
    name: "Domingo de Pascua",
    type: "Día festivo",
    scope: "Internacional",
    desc: "Pascua. Retail, familia y campañas de primavera.",
    lead: 14,
    rule: "easter",
    offset: 0,
  },
  {
    name: "Día Internacional de las Niñas en las TIC",
    type: "Mujeres",
    scope: "Internacional",
    desc: "Cuarto jueves de abril (UIT). Mujeres en tecnología, STEM y talento digital.",
    lead: 14,
    rule: "nth-dow",
    m: 4,
    nth: 4,
    dow: 4,
  },
  {
    name: "Día Mundial de la Contraseña",
    type: "Día tecnológico",
    scope: "Internacional",
    desc: "Primer jueves de mayo. Ciberseguridad y hábitos digitales.",
    rule: "nth-dow",
    m: 5,
    nth: 1,
    dow: 4,
  },
  {
    name: "Hot Sale (referencia)",
    type: "Fecha comercial",
    scope: "México",
    desc: "Último lunes de mayo como marca de la temporada Hot Sale. Confirma fechas AMVO cada año.",
    lead: 30,
    rule: "nth-dow",
    m: 5,
    nth: -1,
    dow: 1,
  },
  {
    name: "Día del Padre",
    type: "Fecha comercial",
    scope: "México",
    desc: "Tercer domingo de junio. Retail, regalos y contenidos familiares.",
    lead: 14,
    rule: "nth-dow",
    m: 6,
    nth: 3,
    dow: 0,
  },
  {
    name: "Día del Programador",
    type: "Día tecnológico",
    scope: "Internacional",
    desc: "Día 256 del año. Comunidad dev, employer branding tech y producto.",
    lead: 7,
    rule: "doy",
    doy: 256,
  },
  {
    name: "Ada Lovelace Day",
    type: "Mujeres",
    scope: "Internacional",
    desc: "Segundo martes de octubre. Mujeres en STEM y referentes tecnológicas.",
    lead: 10,
    rule: "nth-dow",
    m: 10,
    nth: 2,
    dow: 2,
  },
  {
    name: "Revolución Mexicana (oficial)",
    type: "Día festivo",
    scope: "México",
    desc: "Tercer lunes de noviembre. Descanso obligatorio.",
    lead: 14,
    rule: "nth-dow",
    m: 11,
    nth: 3,
    dow: 1,
  },
  {
    name: "Buen Fin (inicio aprox.)",
    type: "Fecha comercial",
    scope: "México",
    desc: "Tercer viernes de noviembre como referencia del Buen Fin. Confirma el fin de semana oficial cada año.",
    lead: 30,
    rule: "nth-dow",
    m: 11,
    nth: 3,
    dow: 5,
  },
  {
    name: "Thanksgiving (EE.UU.)",
    type: "Fecha comercial",
    scope: "Internacional",
    desc: "Cuarto jueves de noviembre. Relevancia para e-commerce y audiencias binacionales.",
    lead: 14,
    rule: "nth-dow",
    m: 11,
    nth: 4,
    dow: 4,
  },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function ymd(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function slug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function nthWeekday(year: number, month: number, nth: number, dow: number) {
  if (nth === -1) {
    const last = new Date(year, month, 0).getDate();
    for (let day = last; day >= 1; day--) {
      if (new Date(year, month - 1, day).getDay() === dow) return day;
    }
    return last;
  }
  const firstDow = new Date(year, month - 1, 1).getDay();
  const day = 1 + ((dow - firstDow + 7) % 7) + (nth - 1) * 7;
  return day;
}

function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function addDays(year: number, month: number, day: number, offset: number) {
  const dt = new Date(year, month - 1, day + offset);
  return { year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate() };
}

function toKeyDate(
  name: string,
  date: string,
  type: KeyDateType,
  scope: ObservanceScope,
  desc: string,
  lead: number,
): KeyDate {
  return {
    id: `obs-${slug(name)}-${date}`,
    name,
    date,
    type,
    description: desc,
    leadDays: lead,
    owner: "",
    campaignId: null,
    notes: `${scope} · Catálogo de marketing`,
    builtin: true,
    scope,
  };
}

export function catalogKeyDates(fromYear: number, toYear: number): KeyDate[] {
  const out: KeyDate[] = [];

  for (let year = fromYear; year <= toYear; year++) {
    for (const item of FIXED) {
      out.push(
        toKeyDate(item.name, ymd(year, item.m, item.d), item.type, item.scope, item.desc, item.lead ?? 7),
      );
    }

    for (const month of NARANJA_MONTHS) {
      out.push(
        toKeyDate(
          "Día Naranja",
          ymd(year, month, 25),
          "Mujeres",
          "Internacional",
          "Día 25 de cada mes contra la violencia hacia mujeres y niñas. Campañas naranja y de prevención.",
          5,
        ),
      );
    }

    for (const item of MOVABLE) {
      let month = 1;
      let day = 1;
      let y = year;
      if (item.rule === "nth-dow") {
        month = item.m;
        day = nthWeekday(year, item.m, item.nth, item.dow);
      } else if (item.rule === "easter") {
        const e = easterSunday(year);
        const shifted = addDays(year, e.month, e.day, item.offset);
        y = shifted.year;
        month = shifted.month;
        day = shifted.day;
      } else {
        const dt = new Date(year, 0, item.doy);
        y = dt.getFullYear();
        month = dt.getMonth() + 1;
        day = dt.getDate();
      }
      out.push(
        toKeyDate(item.name, ymd(y, month, day), item.type, item.scope, item.desc, item.lead ?? 7),
      );
    }

    const thanks = nthWeekday(year, 11, 4, 4);
    const bf = addDays(year, 11, thanks, 1);
    const cm = addDays(year, 11, thanks, 4);
    out.push(
      toKeyDate(
        "Black Friday",
        ymd(bf.year, bf.month, bf.day),
        "Fecha comercial",
        "Internacional",
        "Día siguiente a Thanksgiving. Pico de e-commerce global.",
        21,
      ),
      toKeyDate(
        "Cyber Monday",
        ymd(cm.year, cm.month, cm.day),
        "Fecha comercial",
        "Internacional",
        "Lunes de ofertas digitales. Campañas de e-commerce y performance.",
        14,
      ),
    );
  }

  return out.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

export function currentCatalog(): KeyDate[] {
  const year = new Date().getFullYear();
  return catalogKeyDates(year - 1, year + 1);
}

export function mergeKeyDates(userDates: KeyDate[]): KeyDate[] {
  const catalog = currentCatalog();
  const userNames = new Set(userDates.filter((k) => !k.builtin).map((k) => `${k.name}|${k.date}`));
  const extras = catalog.filter((k) => !userNames.has(`${k.name}|${k.date}`));
  return [...userDates, ...extras].sort((a, b) => a.date.localeCompare(b.date));
}
