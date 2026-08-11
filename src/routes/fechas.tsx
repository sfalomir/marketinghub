import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AlarmClock, Plus, Trash2 } from "lucide-react";
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
import { KEY_DATE_TYPES, type KeyDate } from "@/lib/mh-types";
import { daysUntil, relativeLabel } from "@/lib/mh-utils";

export const Route = createFileRoute("/fechas")({
  head: () => ({
    meta: [
      { title: "Fechas importantes | Marketing Hub" },
      {
        name: "description",
        content:
          "Agenda de días festivos, fechas comerciales, aniversarios y lanzamientos con recordatorios anticipados.",
      },
      { property: "og:title", content: "Fechas importantes | Marketing Hub" },
      {
        property: "og:description",
        content: "Registra fechas clave y prepara las campañas con la anticipación necesaria.",
      },
    ],
  }),
  component: FechasPage,
});

const NONE = "__none__";

function emptyKeyDate(): KeyDate {
  return {
    id: newId(),
    name: "",
    date: format(new Date(), "yyyy-MM-dd"),
    type: "Fecha comercial",
    description: "",
    leadDays: 7,
    owner: "",
    campaignId: null,
    notes: "",
  };
}

function FechasPage() {
  const { data, upsertKeyDate, removeKeyDate } = useMh();
  const [editing, setEditing] = useState<KeyDate | null>(null);
  const [f, setF] = useState({ type: ALL, owner: ALL });

  const list = useMemo(
    () =>
      data.keyDates
        .filter((k) => (f.type === ALL || k.type === f.type) && (f.owner === ALL || k.owner === f.owner))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [data.keyDates, f],
  );

  return (
    <AppShell
      title="Fechas importantes"
      subtitle="El sistema te avisa cuando debes comenzar a preparar cada fecha."
      actions={
        <Button size="sm" onClick={() => setEditing(emptyKeyDate())}>
          <Plus className="mr-1 h-4 w-4" /> Nueva fecha
        </Button>
      }
    >
      <div className="mb-5 grid gap-2 sm:grid-cols-2">
        <FilterSelect
          label="Tipo"
          value={f.type}
          onChange={(v) => setF({ ...f, type: v })}
          options={[...KEY_DATE_TYPES]}
        />
        <FilterSelect
          label="Responsable"
          value={f.owner}
          onChange={(v) => setF({ ...f, owner: v })}
          options={data.people.map((p) => p.name)}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((k) => {
          const n = daysUntil(k.date);
          const prepping = n >= 0 && n <= k.leadDays;
          return (
            <button
              key={k.id}
              onClick={() => setEditing(k)}
              className={`rounded-2xl border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md ${
                prepping ? "border-warning/50" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="min-w-0 text-base font-semibold leading-snug">{k.name}</h3>
                <Badge variant="outline">{k.type}</Badge>
              </div>
              <p className="mt-1 text-sm capitalize text-muted-foreground">
                {format(parseISO(k.date), "EEEE d 'de' MMMM", { locale: es })} · {relativeLabel(k.date)}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{k.description}</p>
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium">
                <AlarmClock className="h-3.5 w-3.5" />
                {prepping
                  ? `Preparar ahora (anticipación ${k.leadDays} días)`
                  : `Anticipación requerida: ${k.leadDays} días`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{k.owner || "Sin responsable"}</p>
            </button>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>{editing.name ? "Editar fecha" : "Nueva fecha"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field className="sm:col-span-2" label="Nombre">
                  <Input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </Field>
                <Field label="Fecha">
                  <Input
                    type="date"
                    value={editing.date}
                    onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  />
                </Field>
                <Field label="Tipo de fecha">
                  <Select
                    value={editing.type}
                    onValueChange={(v) => setEditing({ ...editing, type: v as KeyDate["type"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KEY_DATE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Anticipación (días)">
                  <Input
                    type="number"
                    min={0}
                    value={editing.leadDays}
                    onChange={(e) =>
                      setEditing({ ...editing, leadDays: Number(e.target.value) || 0 })
                    }
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
                <Field className="sm:col-span-2" label="Campaña relacionada">
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
                <Field className="sm:col-span-2" label="Descripción">
                  <Textarea
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                </Field>
                <Field className="sm:col-span-2" label="Notas">
                  <Textarea
                    value={editing.notes}
                    onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  />
                </Field>
              </div>
              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    removeKeyDate(editing.id);
                    setEditing(null);
                  }}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Eliminar
                </Button>
                <Button
                  onClick={() => {
                    if (!editing.name.trim()) return;
                    upsertKeyDate(editing);
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