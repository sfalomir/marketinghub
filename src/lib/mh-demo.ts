import { addDays, format, startOfWeek } from "date-fns";
import type { MhData, Task, Post, Campaign, KeyDate } from "./mh-types";

const base = startOfWeek(new Date(), { weekStartsOn: 1 });
const d = (offset: number) => format(addDays(base, offset), "yyyy-MM-dd");

const people: MhData["people"] = [
  { id: "p1", name: "Ana Rivera", role: "Administrador" },
  { id: "p2", name: "Luis Ortega", role: "Marketing" },
  { id: "p3", name: "Sofía Márquez", role: "Marketing" },
  { id: "p4", name: "Diego Fuentes", role: "Colaborador" },
  { id: "p5", name: "Camila Ruiz", role: "Colaborador" },
];

const campaigns: Campaign[] = [
  {
    id: "c1",
    name: "Back to Business Q3",
    objective: "Generar 300 leads calificados para el equipo comercial",
    start: d(-4),
    end: d(18),
    owner: "Ana Rivera",
    audience: "PyMEs 25-45 años",
    channels: ["LinkedIn", "Instagram", "Blog / Website"],
    budget: 45000,
    status: "Activa",
  },
  {
    id: "c2",
    name: "Lanzamiento App Móvil",
    objective: "5,000 descargas en el primer mes",
    start: d(7),
    end: d(27),
    owner: "Luis Ortega",
    audience: "Usuarios 18-35 años",
    channels: ["Instagram", "TikTok", "YouTube"],
    budget: 80000,
    status: "Planeada",
  },
  {
    id: "c3",
    name: "Awareness de Marca",
    objective: "Aumentar 20% el alcance orgánico mensual",
    start: d(-20),
    end: d(9),
    owner: "Sofía Márquez",
    audience: "Audiencia general",
    channels: ["Facebook", "Instagram", "Blog / Website"],
    budget: null,
    status: "Activa",
  },
];

const tasks: Task[] = [
  ["Brief creativo campaña Q3", "Definir mensajes clave y piezas requeridas.", "Ana Rivera", -3, "Alta", "Estrategia", "c1", "LinkedIn", "En revisión"],
  ["Diseño de key visual", "3 propuestas de arte para el lanzamiento.", "Sofía Márquez", -1, "Alta", "Diseño", "c2", "Instagram", "En proceso"],
  ["Guion video TikTok", "Guion de 30s con hook en los primeros 3s.", "Diego Fuentes", 0, "Media", "Contenido", "c2", "TikTok", "Pendiente"],
  ["Publicar post LinkedIn", "Caso de éxito cliente Grupo Norte.", "Luis Ortega", 0, "Alta", "Redes sociales", "c1", "LinkedIn", "Aprobado"],
  ["Actualizar landing page", "Nuevos textos y formulario de captura.", "Camila Ruiz", 2, "Media", "Web", "c1", "Blog / Website", "En proceso"],
  ["Email newsletter mensual", "Segmentar base y programar envío.", "Luis Ortega", 3, "Media", "Email", "c3", null, "Pendiente"],
  ["Reporte de métricas semanal", "KPIs de alcance, leads y conversión.", "Ana Rivera", 4, "Baja", "Analítica", "c3", null, "Pendiente"],
  ["Sesión de fotos producto", "Coordinar estudio, modelos y props.", "Sofía Márquez", 6, "Alta", "Producción", "c2", "Instagram", "Pendiente"],
  ["Calendario editorial mes 2", "Planear 20 publicaciones del siguiente mes.", "Diego Fuentes", 9, "Media", "Planeación", "c3", null, "Pendiente"],
  ["Cierre campaña Awareness", "Recopilar resultados y aprendizajes.", "Camila Ruiz", -6, "Alta", "Analítica", "c3", null, "Publicado"],
].map((t, i) => {
  const [name, description, assignee, off, priority, category, campaignId, channel, status] = t as [
    string, string, string, number, Task["priority"], string, string | null, Task["channel"], Task["status"],
  ];
  return {
    id: `t${i + 1}`,
    name,
    description,
    assignee,
    dueDate: d(off),
    priority,
    category,
    campaignId,
    channel,
    link: "",
    status,
    comments:
      i % 3 === 0
        ? [{ id: `cm${i}`, author: "Ana Rivera", text: "Revisemos esto en la junta del lunes.", date: d(-1) }]
        : [],
  } satisfies Task;
});

const posts: Post[] = [
  ["Tips para PyMEs digitales", "Educar", -2, "LinkedIn", "Carrusel", "Publicado", "c1"],
  ["Detrás de cámaras del equipo", "Awareness", -1, "Instagram", "Reel", "Publicado", "c3"],
  ["Encuesta: ¿qué te frena a digitalizarte?", "Engagement", 0, "Facebook", "Encuesta", "Programado", "c3"],
  ["Teaser nueva app", "Expectativa", 1, "TikTok", "Video corto", "Aprobación", "c2"],
  ["Caso de éxito Grupo Norte", "Conversión", 2, "LinkedIn", "Post", "Revisión", "c1"],
  ["Blog: 7 métricas que importan", "Tráfico", 3, "Blog / Website", "Artículo", "Producción", "c1"],
  ["Reel de producto en acción", "Awareness", 5, "Instagram", "Reel", "Producción", "c2"],
  ["Live de lanzamiento", "Conversión", 7, "YouTube", "Video largo", "Planeación", "c2"],
  ["Countdown lanzamiento", "Expectativa", 8, "Instagram", "Historia", "Planeación", "c2"],
  ["Tutorial: primeros pasos", "Retención", 10, "YouTube", "Video largo", "Idea", "c2"],
  ["Testimonio de cliente", "Conversión", 12, "Facebook", "Video corto", "Idea", "c1"],
  ["Infografía de resultados", "Awareness", 14, "LinkedIn", "Infografía", "Idea", "c3"],
  ["Reto creativo con la comunidad", "Engagement", 16, "TikTok", "Video corto", "Idea", "c3"],
  ["Blog: guía de campañas 2026", "Tráfico", 19, "Blog / Website", "Artículo", "Idea", "c1"],
  ["Resumen mensual de marca", "Awareness", 22, "Instagram", "Carrusel", "Idea", "c3"],
].map((p, i) => {
  const [title, objective, off, channel, contentType, stage, campaignId] = p as [
    string, string, number, Post["channel"], string, Post["stage"], string,
  ];
  return {
    id: `s${i + 1}`,
    title,
    objective,
    date: d(off),
    channel,
    contentType,
    audience: "Audiencia principal",
    copy: `${title}. Contenido pensado para ${objective.toLowerCase()}.`,
    cta: "Conoce más en el link de la bio",
    assignee: people[(i % 4) + 1]!.name,
    stage,
    link: "",
    campaignId,
  } satisfies Post;
});

const keyDates: KeyDate[] = [
  ["Día del Cliente", 1, "Fecha comercial", "Activación especial para clientes actuales.", 7, "c3"],
  ["Aniversario de la empresa", 4, "Aniversario", "12 años de operación.", 14, null],
  ["Lanzamiento App Móvil", 7, "Lanzamiento", "Go live oficial de la aplicación.", 21, "c2"],
  ["Expo Marketing Nacional", 11, "Evento", "Stand y conferencia de marca.", 20, "c1"],
  ["Cumpleaños del CEO", 13, "Cumpleaños", "Publicación institucional interna.", 5, null],
  ["Buen Fin", 18, "Fecha comercial", "Promociones y campaña de descuentos.", 30, "c1"],
  ["Día Mundial del Ahorro", 21, "Día festivo", "Contenido educativo financiero.", 10, "c3"],
  ["Junta trimestral de resultados", 24, "Institucional", "Presentación de KPIs de Marketing.", 7, null],
  ["Inicio de temporada navideña", 27, "Fecha comercial", "Arranque del calendario decembrino.", 30, "c1"],
  ["Webinar de cierre de año", 30, "Evento", "Sesión con clientes clave.", 15, "c2"],
].map((k, i) => {
  const [name, off, type, description, leadDays, campaignId] = k as [
    string, number, KeyDate["type"], string, number, string | null,
  ];
  return {
    id: `k${i + 1}`,
    name,
    date: d(off),
    type,
    description,
    leadDays,
    owner: people[i % 5]!.name,
    campaignId,
    notes: "",
  } satisfies KeyDate;
});

export const demoData: MhData = { people, tasks, posts, campaigns, keyDates };