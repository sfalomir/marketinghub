import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/mh/AppShell";
import { ALL, Field, FilterSelect } from "@/components/mh/form-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { newId, useMh } from "@/lib/mh-store";
import { CHANNELS, CONTENT_STAGES, type ContentStage, type Post } from "@/lib/mh-types";
import { channelClass, relativeLabel } from "@/lib/mh-utils";

export const Route = createFileRoute("/contenido")({
  head: () => ({
    meta: [
      { title: "Planificador de contenido | Marketing Hub" },
      {
        name: "description",
        content:
          "Planea publicaciones de Instagram, Facebook, LinkedIn, TikTok, YouTube y Blog con su flujo de aprobación.",
      },
      { property: "og:title", content: "Planificador de contenido | Marketing Hub" },
      {
        property: "og:description",
        content: "Flujo Idea → Planeación → Producción → Revisión → Aprobación → Programado → Publicado.",
      },
    ],
  }),
  component: ContenidoPage,
});

const NONE = "__none__";

function emptyPost(): Post {
  return {
    id: newId(),
    title: "",
    objective: "",
    date: format(new Date(), "yyyy-MM-dd"),
    channel: "Instagram",
    contentType: "Post",
    audience: "",
    copy: "",
    cta: "",
    assignee: "",
    stage: "Idea",
    link: "",
    campaignId: null,
  };
}

function ContenidoPage() {
  const { data, upsertPost, removePost } = useMh();
  const [editing, setEditing] = useState<Post | null>(null);
  const [f, setF] = useState({ channel: ALL, assignee: ALL, campaign: ALL });

  const filtered = useMemo(
    () =>
      data.posts
        .filter(
          (p) =>
            (f.channel === ALL || p.channel === f.channel) &&
            (f.assignee === ALL || p.assignee === f.assignee) &&
            (f.campaign === ALL || p.campaignId === f.campaign),
        )
        .sort((a, b) => a.date.localeCompare(b.date)),
    [data.posts, f],
  );

  return (
    <AppShell
      title="Social Media Planner"
      subtitle="Contenido organizado por etapa del flujo de producción."
      actions={
        <Button size="sm" onClick={() => setEditing(emptyPost())}>
          <Plus className="mr-1 h-4 w-4" /> Nueva publicación
        </Button>
      }
    >
      <div className="mb-5 grid gap-2 sm:grid-cols-3">
        <FilterSelect
          label="Canal"
          value={f.channel}
          onChange={(v) => setF({ ...f, channel: v })}
          options={[...CHANNELS]}
        />
        <FilterSelect
          label="Responsable"
          value={f.assignee}
          onChange={(v) => setF({ ...f, assignee: v })}
          options={data.people.map((p) => p.name)}
        />
        <FilterSelect
          label="Campaña"
          value={f.campaign}
          onChange={(v) => setF({ ...f, campaign: v })}
          options={data.campaigns.map((c) => ({ value: c.id, label: c.name }))}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {CONTENT_STAGES.map((stage) => {
          const items = filtered.filter((p) => p.stage === stage);
          return (
            <section key={stage} className="rounded-2xl bg-surface p-3">
              <header className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold">{stage}</h2>
                <Badge variant="secondary">{items.length}</Badge>
              </header>
              <div className="space-y-2">
                {items.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setEditing(p)}
                    className="w-full rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md"
                  >
                    <p className="text-sm font-semibold leading-snug">{p.title}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="outline" className={channelClass[p.channel]}>
                        {p.channel}
                      </Badge>
                      <Badge variant="outline">{relativeLabel(p.date)}</Badge>
                    </div>
                    <p className="mt-2 truncate text-xs text-muted-foreground">
                      {p.contentType} · {p.assignee}
                    </p>
                  </button>
                ))}
                {items.length === 0 && (
                  <p className="px-1 py-3 text-xs text-muted-foreground">Sin contenido</p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {editing.title ? "Editar publicación" : "Nueva publicación"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field className="sm:col-span-2" label="Título o tema">
                  <Input
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  />
                </Field>
                <Field label="Objetivo">
                  <Input
                    value={editing.objective}
                    onChange={(e) => setEditing({ ...editing, objective: e.target.value })}
                  />
                </Field>
                <Field label="Fecha de publicación">
                  <Input
                    type="date"
                    value={editing.date}
                    onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  />
                </Field>
                <Field label="Canal">
                  <Select
                    value={editing.channel}
                    onValueChange={(v) => setEditing({ ...editing, channel: v as Post["channel"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNELS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Tipo de contenido">
                  <Input
                    value={editing.contentType}
                    onChange={(e) => setEditing({ ...editing, contentType: e.target.value })}
                  />
                </Field>
                <Field label="Audiencia">
                  <Input
                    value={editing.audience}
                    onChange={(e) => setEditing({ ...editing, audience: e.target.value })}
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
                <Field className="sm:col-span-2" label="Copy">
                  <Textarea
                    value={editing.copy}
                    onChange={(e) => setEditing({ ...editing, copy: e.target.value })}
                  />
                </Field>
                <Field label="CTA">
                  <Input
                    value={editing.cta}
                    onChange={(e) => setEditing({ ...editing, cta: e.target.value })}
                  />
                </Field>
                <Field label="Estado del flujo">
                  <Select
                    value={editing.stage}
                    onValueChange={(v) => setEditing({ ...editing, stage: v as ContentStage })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_STAGES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Field label="Link o archivo">
                  <Input
                    placeholder="https://"
                    value={editing.link}
                    onChange={(e) => setEditing({ ...editing, link: e.target.value })}
                  />
                </Field>
              </div>
              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    removePost(editing.id);
                    setEditing(null);
                  }}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Eliminar
                </Button>
                <Button
                  onClick={() => {
                    if (!editing.title.trim()) return;
                    upsertPost(editing);
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