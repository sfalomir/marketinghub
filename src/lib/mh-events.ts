import { mergeKeyDates } from "./mh-observances";
import type { KeyDateType, MhData } from "./mh-types";

export type EventKind =
  | "Publicación"
  | "Campaña"
  | "Evento"
  | "Fecha importante"
  | "Reunión"
  | "Tarea"
  | "Lanzamiento"
  | "Día festivo"
  | "Día tecnológico"
  | "Día cultural"
  | "Mujeres";

export interface CalEvent {
  id: string;
  title: string;
  date: string;
  kind: EventKind;
  detail: string;
  owner: string;
  scope?: string;
  builtin?: boolean;
}

export const kindClass: Record<EventKind, string> = {
  Publicación: "bg-info/12 text-info border-info/30",
  Campaña: "bg-primary/10 text-primary border-primary/30",
  Evento: "bg-accent text-accent-foreground border-accent",
  "Fecha importante": "bg-warning/18 text-warning-foreground border-warning/35",
  Reunión: "bg-secondary text-secondary-foreground border-border",
  Tarea: "bg-success/12 text-success border-success/30",
  Lanzamiento: "bg-destructive/10 text-destructive border-destructive/30",
  "Día festivo": "bg-primary/12 text-primary border-primary/30",
  "Día tecnológico": "bg-info/14 text-info border-info/30",
  "Día cultural": "bg-success/12 text-success border-success/30",
  Mujeres: "bg-destructive/12 text-destructive border-destructive/30",
};

function kindFromDateType(type: KeyDateType): EventKind {
  if (type === "Evento") return "Evento";
  if (type === "Lanzamiento") return "Lanzamiento";
  if (type === "Día festivo" || type === "Día tecnológico" || type === "Día cultural" || type === "Mujeres") {
    return type;
  }
  return "Fecha importante";
}

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
  for (const k of mergeKeyDates(data.keyDates)) {
    events.push({
      id: `key-${k.id}`,
      title: k.name,
      date: k.date,
      kind: kindFromDateType(k.type),
      detail: k.scope ? `${k.scope} · ${k.description}` : k.description,
      owner: k.owner,
      scope: k.scope,
      builtin: k.builtin,
    });
  }
  return events.sort((a, b) => a.date.localeCompare(b.date));
}