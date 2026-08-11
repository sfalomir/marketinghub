import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/mh/AppShell";
import { ALL, FilterSelect } from "@/components/mh/form-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMh } from "@/lib/mh-store";
import { buildEvents, kindClass, type CalEvent } from "@/lib/mh-events";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendario de Marketing | Marketing Hub" },
      {
        name: "description",
        content:
          "Vista mensual, semanal y diaria de publicaciones, campañas, eventos, tareas y fechas importantes.",
      },
      { property: "og:title", content: "Calendario de Marketing | Marketing Hub" },
      {
        property: "og:description",
        content: "Todas las actividades de Marketing en un solo calendario.",
      },
    ],
  }),
  component: CalendarioPage,
});

const KINDS = [
  "Publicación",
  "Campaña",
  "Evento",
  "Fecha importante",
  "Reunión",
  "Tarea",
  "Lanzamiento",
];

function CalendarioPage() {
  const { data } = useMh();
  const [view, setView] = useState<"mes" | "semana" | "dia">("mes");
  const [cursor, setCursor] = useState(new Date());
  const [kind, setKind] = useState(ALL);
  const [owner, setOwner] = useState(ALL);
  const [selected, setSelected] = useState<CalEvent | null>(null);

  const events = useMemo(
    () =>
      buildEvents(data).filter(
        (e) => (kind === ALL || e.kind === kind) && (owner === ALL || e.owner === owner),
      ),
    [data, kind, owner],
  );

  const days = useMemo(() => {
    if (view === "dia") return [cursor];
    if (view === "semana")
      return eachDayOfInterval({
        start: startOfWeek(cursor, { weekStartsOn: 1 }),
        end: endOfWeek(cursor, { weekStartsOn: 1 }),
      });
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
    });
  }, [view, cursor]);

  const move = (dir: number) =>
    setCursor((c) =>
      view === "mes" ? addMonths(c, dir) : addDays(c, dir * (view === "semana" ? 7 : 1)),
    );

  const dayEvents = (day: Date) => events.filter((e) => isSameDay(parseISO(e.date), day));

  return (
    <AppShell
      title="Calendario de Marketing"
      subtitle="Publicaciones, campañas, eventos, tareas y fechas clave en un solo lugar."
    >
      <div className="mb-4 grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="mes">Mensual</TabsTrigger>
            <TabsTrigger value="semana">Semanal</TabsTrigger>
            <TabsTrigger value="dia">Diaria</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => move(-1)} aria-label="Anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => move(1)} aria-label="Siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="truncate text-sm font-semibold capitalize">
            {view === "dia"
              ? format(cursor, "EEEE d 'de' MMMM yyyy", { locale: es })
              : format(cursor, "MMMM yyyy", { locale: es })}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setCursor(new Date())}>
            Hoy
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <FilterSelect label="Tipo" value={kind} onChange={setKind} options={KINDS} />
          <FilterSelect
            label="Responsable"
            value={owner}
            onChange={setOwner}
            options={data.people.map((p) => p.name)}
          />
        </div>
      </div>

      {view === "mes" ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-7 border-b border-border bg-surface">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <div key={d} className="p-2 text-center text-xs font-semibold text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const evs = dayEvents(day);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-24 border-b border-r border-border p-1.5 ${
                    isSameMonth(day, cursor) ? "" : "bg-surface/60"
                  }`}
                >
                  <span
                    className={`inline-grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                      isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-1">
                    {evs.slice(0, 3).map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setSelected(e)}
                        className={`block w-full truncate rounded-md border px-1.5 py-0.5 text-left text-[11px] ${kindClass[e.kind]}`}
                      >
                        {e.title}
                      </button>
                    ))}
                    {evs.length > 3 && (
                      <span className="px-1 text-[11px] text-muted-foreground">
                        +{evs.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={`grid gap-3 ${view === "semana" ? "md:grid-cols-2 xl:grid-cols-4" : ""}`}>
          {days.map((day) => {
            const evs = dayEvents(day);
            return (
              <section key={day.toISOString()} className="rounded-2xl border border-border bg-card p-4">
                <h2 className="text-sm font-semibold capitalize">
                  {format(day, "EEEE d 'de' MMMM", { locale: es })}
                </h2>
                <div className="mt-3 space-y-2">
                  {evs.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setSelected(e)}
                      className="block w-full rounded-xl bg-surface p-3 text-left transition-colors hover:bg-secondary"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-medium">{e.title}</span>
                        <Badge variant="outline" className={kindClass[e.kind]}>
                          {e.kind}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {e.detail} · {e.owner}
                      </p>
                    </button>
                  ))}
                  {evs.length === 0 && (
                    <p className="text-sm text-muted-foreground">Sin actividades</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
              </DialogHeader>
              <Badge variant="outline" className={`w-fit ${kindClass[selected.kind]}`}>
                {selected.kind}
              </Badge>
              <p className="text-sm capitalize text-muted-foreground">
                {format(parseISO(selected.date), "EEEE d 'de' MMMM yyyy", { locale: es })}
              </p>
              <p className="text-sm">{selected.detail}</p>
              <p className="text-sm text-muted-foreground">
                Responsable: {selected.owner || "Sin asignar"}
              </p>
              <p className="text-xs text-muted-foreground">
                Edita esta actividad desde su módulo (Tareas, Contenido, Campañas o Fechas
                importantes).
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}