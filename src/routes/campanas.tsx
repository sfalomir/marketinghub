import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/mh/AppShell";
import { Field } from "@/components/mh/form-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
import { CHANNELS, type Campaign } from "@/lib/mh-types";
import { channelClass, priorityClass, relativeLabel } from "@/lib/mh-utils";

export const Route = createFileRoute("/campanas")({
  head: () => ({
    meta: [
      { title: "Campañas | Marketing Hub" },
      {
        name: "description",
        content:
          "Administra campañas de Marketing con objetivo, fechas, audiencia, canales, presupuesto y actividades asociadas.",
      },
      { property: "og:title", content: "Campañas | Marketing Hub" },
      {
        property: "og:description",
        content: "Visualiza tareas y publicaciones asociadas a cada campaña activa.",
      },
    ],
  }),
  component: CampanasPage,
});

const NONE = "__none__";

function emptyCampaign(): Campaign {
  const t = format(new Date(), "yyyy-MM-dd");
  return {
    id: newId(),
    name: "",
    objective: "",
    start: t,
    end: t,
    owner: "",
    audience: "",
    channels: [],
    budget: null,
    status: "Planeada",
  };
}

function CampanasPage() {
  const { data, upsertCampaign, removeCampaign } = useMh();
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [detail, setDetail] = useState<Campaign | null>(null);

  return (
    <AppShell
      title="Campañas"
      subtitle="Todas las iniciativas de Marketing con sus actividades relacionadas."
      actions={
        <Button size="sm" onClick={() => setEditing(emptyCampaign())}>
          <Plus className="mr-1 h-4 w-4" /> Nueva campaña
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {data.campaigns.map((c) => {
          const tasks = data.tasks.filter((t) => t.campaignId === c.id);
          const posts = data.posts.filter((p) => p.campaignId === c.id);
          const done = tasks.filter((t) => t.status === "Publicado" || t.status === "Aprobado").length;
          const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
          return (
            <article key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold">{c.name}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{c.objective}</p>
                </div>
                <Badge
                  variant="outline"
                  className={c.status === "Activa" ? priorityClass.Baja : ""}
                >
                  {c.status}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {format(parseISO(c.start), "d MMM", { locale: es })} —{" "}
                {format(parseISO(c.end), "d MMM yyyy", { locale: es })} · Termina{" "}
                {relativeLabel(c.end).toLowerCase()}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.channels.map((ch) => (
                  <Badge key={ch} variant="outline" className={channelClass[ch]}>
                    {ch}
                  </Badge>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Avance de tareas</span>
                  <span>{pct}%</span>
                </div>
                <Progress value={pct} className="mt-1.5 h-2" />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Stat label="Responsable" value={c.owner} />
                <Stat label="Audiencia" value={c.audience} />
                <Stat label="Tareas" value={String(tasks.length)} />
                <Stat
                  label="Presupuesto"
                  value={c.budget ? `$${c.budget.toLocaleString("es-MX")}` : "—"}
                />
              </dl>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setDetail(c)}>
                  Ver actividades ({tasks.length + posts.length})
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(c)}>
                  Editar
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.name}</DialogTitle>
              </DialogHeader>
              <section>
                <h3 className="mb-2 text-sm font-semibold">Tareas</h3>
                <ul className="space-y-2">
                  {data.tasks
                    .filter((t) => t.campaignId === detail.id)
                    .map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-surface p-2.5 text-sm"
                      >
                        <span className="min-w-0 truncate">{t.name}</span>
                        <Badge variant="outline">{t.status}</Badge>
                      </li>
                    ))}
                </ul>
              </section>
              <section className="mt-4">
                <h3 className="mb-2 text-sm font-semibold">Publicaciones</h3>
                <ul className="space-y-2">
                  {data.posts
                    .filter((p) => p.campaignId === detail.id)
                    .map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-surface p-2.5 text-sm"
                      >
                        <span className="min-w-0 truncate">{p.title}</span>
                        <Badge variant="outline" className={channelClass[p.channel]}>
                          {p.channel}
                        </Badge>
                      </li>
                    ))}
                </ul>
              </section>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>{editing.name ? "Editar campaña" : "Nueva campaña"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field className="sm:col-span-2" label="Nombre">
                  <Input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </Field>
                <Field className="sm:col-span-2" label="Objetivo">
                  <Textarea
                    value={editing.objective}
                    onChange={(e) => setEditing({ ...editing, objective: e.target.value })}
                  />
                </Field>
                <Field label="Inicio">
                  <Input
                    type="date"
                    value={editing.start}
                    onChange={(e) => setEditing({ ...editing, start: e.target.value })}
                  />
                </Field>
                <Field label="Fin">
                  <Input
                    type="date"
                    value={editing.end}
                    onChange={(e) => setEditing({ ...editing, end: e.target.value })}
                  />
                </Field>
                <Field label="Responsable">
                  <Select
                    value={editing.owner || NONE}
                    onValueChange={(v) => setEditing({ ...editing, owner: v === NONE ? "" : v })}
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
                <Field label="Estado">
                  <Select
                    value={editing.status}
                    onValueChange={(v) =>
                      setEditing({ ...editing, status: v as Campaign["status"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Planeada", "Activa", "Finalizada"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Audiencia">
                  <Input
                    value={editing.audience}
                    onChange={(e) => setEditing({ ...editing, audience: e.target.value })}
                  />
                </Field>
                <Field label="Presupuesto (opcional)">
                  <Input
                    type="number"
                    value={editing.budget ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        budget: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field className="sm:col-span-2" label="Canales">
                  <div className="flex flex-wrap gap-2">
                    {CHANNELS.map((ch) => {
                      const on = editing.channels.includes(ch);
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              channels: on
                                ? editing.channels.filter((c) => c !== ch)
                                : [...editing.channels, ch],
                            })
                          }
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            on
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground"
                          }`}
                        >
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    removeCampaign(editing.id);
                    setEditing(null);
                  }}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Eliminar
                </Button>
                <Button
                  onClick={() => {
                    if (!editing.name.trim()) return;
                    upsertCampaign(editing);
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value || "—"}</dd>
    </div>
  );
}