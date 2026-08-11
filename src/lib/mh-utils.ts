import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Channel, Priority } from "./mh-types";

export const today = () => new Date(new Date().toDateString());

export const daysUntil = (iso: string) => differenceInCalendarDays(parseISO(iso), today());

export const isOverdue = (iso: string) => daysUntil(iso) < 0;

export const priorityClass: Record<Priority, string> = {
  Alta: "bg-destructive/10 text-destructive border-destructive/25",
  Media: "bg-warning/15 text-warning-foreground border-warning/30",
  Baja: "bg-success/12 text-success border-success/25",
};

export const channelClass: Record<Channel, string> = {
  Instagram: "bg-accent text-accent-foreground border-accent",
  Facebook: "bg-info/12 text-info border-info/25",
  LinkedIn: "bg-primary/10 text-primary border-primary/25",
  TikTok: "bg-foreground/8 text-foreground border-foreground/15",
  YouTube: "bg-destructive/10 text-destructive border-destructive/25",
  "Blog / Website": "bg-success/12 text-success border-success/25",
};

export const stageClass = "bg-secondary text-secondary-foreground border-border";

export function relativeLabel(iso: string) {
  const n = daysUntil(iso);
  if (n === 0) return "Hoy";
  if (n === 1) return "Mañana";
  if (n === -1) return "Ayer";
  if (n < 0) return `Hace ${Math.abs(n)} días`;
  return `En ${n} días`;
}