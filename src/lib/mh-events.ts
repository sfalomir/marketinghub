import type { MhData } from "./mh-types";

export type EventKind =
  | "Publicación"
  | "Campaña"
  | "Evento"
  | "Fecha importante"
  | "Reunión"
  | "Tarea"
  | "Lanzamiento";

export interface CalEvent {
  id: string;
  title: string;
  date: string;
  kind: EventKind;
  detail: string;
  owner: string;
}

export const kindClass: Record<EventKind, string> = {
  Publicación: "bg-info/12 text-info border-info/30",
  Campaña: "bg-primary/10 text-primary border-primary/30",
  Evento: "bg-accent text-accent-foreground border-accent",
  "Fecha importante": "bg-warning/18 text-warning-foreground border-warning/35",
  Reunión: "bg-secondary text-secondary-foreground border-border",
  Tarea: "bg-success/12 text-success border-success/30",
  Lanzamiento: "bg-destructive/10 text-destructive border-destructive/30",
};

export function buildEvents(data: MhData): CalEvent[] {
  const events: CalEvent[] = [];

  for (const t of data.tasks) {
    events.push({
      id: `task-${t.id}`,
      title: t.name,
      date: t.dueDate,
      kind: "Tarea",
      detail: `${t.status} · Prioridad ${t.priority}`,
      owner: t.assignee,
    });
  }
  for (const p of data.posts) {
    events.push({
      id: `post-${p.id}`,
      title: p.title,
      date: p.date,
      kind: "Publicación",
      detail: `${p.channel} · ${p.stage}`,
      owner: p.assignee,
    });
  }
  for (const c of data.campaigns) {
    events.push({
      id: `camp-start-${c.id}`,
      title: `Inicia: ${c.name}`,
      date: c.start,
      kind: "Campaña",
      detail: c.objective,
      owner: c.owner,
    });
    events.push({
      id: `camp-end-${c.id}`,
      title: `Termina: ${c.name}`,
      date: c.end,
      kind: "Campaña",
      detail: c.objective,
      owner: c.owner,
    });
  }
  for (const k of data.keyDates) {
    const kind: EventKind =
      k.type === "Evento" ? "Evento" : k.type === "Lanzamiento" ? "Lanzamiento" : "Fecha importante";
    events.push({
      id: `key-${k.id}`,
      title: k.name,
      date: k.date,
      kind,
      detail: k.description,
      owner: k.owner,
    });
  }
  return events.sort((a, b) => a.date.localeCompare(b.date));
}