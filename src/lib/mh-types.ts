export type Priority = "Alta" | "Media" | "Baja";

export const TASK_STATUSES = [
  "Pendiente",
  "En proceso",
  "En revisión",
  "Aprobado",
  "Publicado",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const CONTENT_STAGES = [
  "Idea",
  "Planeación",
  "Producción",
  "Revisión",
  "Aprobación",
  "Programado",
  "Publicado",
] as const;
export type ContentStage = (typeof CONTENT_STAGES)[number];

export const CHANNELS = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "Blog / Website",
] as const;
export type Channel = (typeof CHANNELS)[number];

export const KEY_DATE_TYPES = [
  "Día festivo",
  "Fecha comercial",
  "Aniversario",
  "Cumpleaños",
  "Evento",
  "Lanzamiento",
  "Institucional",
  "Campaña",
] as const;
export type KeyDateType = (typeof KEY_DATE_TYPES)[number];

export type Role = "Administrador" | "Marketing" | "Colaborador";

export interface Person {
  id: string;
  name: string;
  role: Role;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  assignee: string;
  dueDate: string; // yyyy-MM-dd
  priority: Priority;
  category: string;
  campaignId: string | null;
  channel: Channel | null;
  link: string;
  status: TaskStatus;
  comments: Comment[];
}

export interface Post {
  id: string;
  title: string;
  objective: string;
  date: string;
  channel: Channel;
  contentType: string;
  audience: string;
  copy: string;
  cta: string;
  assignee: string;
  stage: ContentStage;
  link: string;
  campaignId: string | null;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  start: string;
  end: string;
  owner: string;
  audience: string;
  channels: Channel[];
  budget: number | null;
  status: "Planeada" | "Activa" | "Finalizada";
}

export interface KeyDate {
  id: string;
  name: string;
  date: string;
  type: KeyDateType;
  description: string;
  leadDays: number;
  owner: string;
  campaignId: string | null;
  notes: string;
}

export interface MhData {
  people: Person[];
  tasks: Task[];
  posts: Post[];
  campaigns: Campaign[];
  keyDates: KeyDate[];
}