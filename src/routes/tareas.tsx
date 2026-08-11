import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { GripVertical, MessageSquare, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/mh/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL, NONE, Field, FilterSelect } from "@/components/mh/form-bits";
import { newId, useMh } from "@/lib/mh-store";
import { CHANNELS, TASK_STATUSES, type Task, type TaskStatus } from "@/lib/mh-types";
import { isOverdue, priorityClass, relativeLabel } from "@/lib/mh-utils";

export const Route = createFileRoute("/tareas")({
  head: () => ({
    meta: [
      { title: "Tablero de tareas | Marketing Hub" },
      {
        name: "description",
        content:
          "Tablero Kanban para organizar las tareas de Marketing por estado, responsable y prioridad.",
      },
      { property: "og:title", content: "Tablero de tareas | Marketing Hub" },
      {
        property: "og:description",
        content: "Arrastra tus tareas entre Pendiente, En proceso, Revisión, Aprobado y Publicado.",
      },
    ],
  }),
  component: TareasPage,
});

function emptyTask(): Task {
  return {
    id: newId(),
    name: "",
    description: "",
    assignee: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    priority: "Media",
    category: "Contenido",
    campaignId: null,
    channel: null,
    link: "",
    status: "Pendiente",
    comments: [],
  };
}

function TareasPage() {
  const { data, upsertTask, removeTask } = useMh();
  const [editing, setEditing] = useState<Task | null>(null);
  const [comment, setComment] = useState("");
  const [f, setF] = useState({ assignee: ALL, priority: ALL, campaign: ALL, channel: ALL });

  const filtered = useMemo(
    () =>
      data.tasks.filter(
        (t) =>
          (f.assignee === ALL || t.assignee === f.assignee) &&
          (f.priority === ALL || t.priority === f.priority) &&
          (f.campaign === ALL || t.campaignId === f.campaign) &&
          (f.channel === ALL || t.channel === f.channel),
      ),
    [data.tasks, f],
  );

  const drop = (status: TaskStatus) => (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const task = data.tasks.find((t) => t.id === id);
    if (task && task.status !== status) upsertTask({ ...task, status });
  };

  const campaignName = (id: string | null) =>
    data.campaigns.find((c) => c.id === id)?.name ?? null;

  return (
    <AppShell
      title="Tablero de tareas"
      subtitle="Arrastra las tarjetas para actualizar el estado de cada actividad."
      actions={
        <Button size="sm" onClick={() => setEditing(emptyTask())}>
          <Plus className="mr-1 h-4 w-4" /> Nueva tarea
        </Button>
      }
    >
      <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          label="Responsable"
          value={f.assignee}
          onChange={(v) => setF({ ...f, assignee: v })}
          options={data.people.map((p) => p.name)}
        />
        <FilterSelect
          label="Prioridad"
          value={f.priority}
          onChange={(v) => setF({ ...f, priority: v })}
          options={["Alta", "Media", "Baja"]}
        />
        <FilterSelect
          label="Campaña"
          value={f.campaign}
          onChange={(v) => setF({ ...f, campaign: v })}
          options={data.campaigns.map((c) => ({ value: c.id, label: c.name }))}
        />
        <FilterSelect
          label="Canal"
          value={f.channel}
          onChange={(v) => setF({ ...f, channel: v })}
          options={[...CHANNELS]}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {TASK_STATUSES.map((status) => {
          const items = filtered.filter((t) => t.status === status);
          return (
            <section
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={drop(status)}
              className="flex min-h-32 flex-col gap-2 rounded-2xl bg-surface p-3"
            >
              <header className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold">{status}</h2>
                <Badge variant="secondary">{items.length}</Badge>
              </header>
              {items.map((t) => (
                <article
                  key={t.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
                  onClick={() => setEditing(t)}
                  className="cursor-pointer rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="min-w-0 text-sm font-semibold leading-snug">{t.name}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className={priorityClass[t.priority]}>
                      {t.priority}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        isOverdue(t.dueDate) && t.status !== "Publicado"
                          ? "border-destructive/25 bg-destructive/10 text-destructive"
                          : ""
                      }
                    >
                      {relativeLabel(t.dueDate)}
                    </Badge>
                  </div>
                  <p className="mt-2 truncate text-xs text-muted-foreground">
                    {t.assignee} · {campaignName(t.campaignId) ?? t.category}
                  </p>
                  {t.comments.length > 0 && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" /> {t.comments.length}
                    </p>
                  )}
                </article>
              ))}
              {items.length === 0 && (
                <p className="px-1 py-4 text-xs text-muted-foreground">Sin tareas</p>
              )}
            </section>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>{editing.name ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field className="sm:col-span-2" label="Nombre">
                  <Input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </Field>
                <Field className="sm:col-span-2" label="Descripción">
                  <Textarea
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                </Field>
                <Field label="Responsable">
                  <Select
                    value={editing.assignee || NONE}
                    onValueChange={(v) => setEditing({ ...editing, assignee: v === NONE ? "" : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sin asignar</SelectItem>
                      {data.people.map((p) => (
                        <SelectItem key={p.id} value={p.name}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Fecha límite">
                  <Input
                    type="date"
                    value={editing.dueDate}
                    onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })}
                  />
                </Field>
                <Field label="Prioridad">
                  <Select
                    value={editing.priority}
                    onValueChange={(v) =>
                      setEditing({ ...editing, priority: v as Task["priority"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Alta", "Media", "Baja"].map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Estado">
                  <Select
                    value={editing.status}
                    onValueChange={(v) => setEditing({ ...editing, status: v as TaskStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Categoría">
                  <Input
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  />
                </Field>
                <Field label="Campaña">
                  <Select
                    value={editing.campaignId ?? NONE}
                    onValueChange={(v) =>
                      setEditing({ ...editing, campaignId: v === NONE ? null : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sin campaña</SelectItem>
                      {data.campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Canal">
                  <Select
                    value={editing.channel ?? NONE}
                    onValueChange={(v) =>
                      setEditing({ ...editing, channel: v === NONE ? null : (v as Task["channel"]) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sin canal</SelectItem>
                      {CHANNELS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field className="sm:col-span-2" label="Archivo o enlace">
                  <Input
                    placeholder="https://"
                    value={editing.link}
                    onChange={(e) => setEditing({ ...editing, link: e.target.value })}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Label className="text-xs font-medium text-muted-foreground">Comentarios</Label>
                  <div className="mt-2 space-y-2">
                    {editing.comments.map((c) => (
                      <div key={c.id} className="rounded-lg bg-surface p-2 text-sm">
                        <span className="font-medium">{c.author}</span>{" "}
                        <span className="text-xs text-muted-foreground">{c.date}</span>
                        <p className="text-muted-foreground">{c.text}</p>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Escribe un comentario"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (!comment.trim()) return;
                          setEditing({
                            ...editing,
                            comments: [
                              ...editing.comments,
                              {
                                id: newId(),
                                author: editing.assignee || "Equipo",
                                text: comment,
                                date: format(new Date(), "yyyy-MM-dd"),
                              },
                            ],
                          });
                          setComment("");
                        }}
                      >
                        Agregar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    removeTask(editing.id);
                    setEditing(null);
                  }}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Eliminar
                </Button>
                <Button
                  onClick={() => {
                    if (!editing.name.trim()) return;
                    upsertTask(editing);
                    setEditing(null);
                  }}
                >
                  Guardar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
