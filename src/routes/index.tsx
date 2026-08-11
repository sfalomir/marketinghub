import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Megaphone,
  Send,
} from "lucide-react";
import { AppShell } from "@/components/mh/AppShell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMh } from "@/lib/mh-store";
import { mergeKeyDates } from "@/lib/mh-observances";
import { channelClass, daysUntil, priorityClass, relativeLabel } from "@/lib/mh-utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marketing Hub — Centro de control de Marketing" },
      {
        name: "description",
        content:
          "Dashboard con tareas de hoy, pendientes, vencidas, próximas publicaciones, campañas activas y fechas importantes.",
      },
      { property: "og:title", content: "Marketing Hub — Centro de control de Marketing" },
      {
        property: "og:description",
        content: "Tablero, calendario, contenido y campañas del equipo de Marketing en un solo lugar.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, reset } = useMh();

  const m = useMemo(() => {
    const open = data.tasks.filter((t) => t.status !== "Publicado");
    const overdue = open.filter((t) => daysUntil(t.dueDate) < 0);
    const todayTasks = open.filter((t) => daysUntil(t.dueDate) === 0);
    const week = open.filter((t) => daysUntil(t.dueDate) > 0 && daysUntil(t.dueDate) <= 7);
    const allDates = mergeKeyDates(data.keyDates);
    const upcomingDates = allDates
      .filter((k) => daysUntil(k.date) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
    const nextPosts = data.posts
      .filter((p) => daysUntil(p.date) >= 0 && p.stage !== "Publicado")
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
    const pendingApproval = data.posts.filter(
      (p) => p.stage === "Revisión" || p.stage === "Aprobación",
    );
    const active = data.campaigns.filter((c) => c.status === "Activa");
    const byPerson = data.people.map((p) => ({
      name: p.name,
      role: p.role,
      total: open.filter((t) => t.assignee === p.name).length,
      late: overdue.filter((t) => t.assignee === p.name).length,
    }));
    const publishedWeek = data.posts.filter(
      (p) => p.stage === "Publicado" && daysUntil(p.date) >= -7,
    ).length;
    const doneWeek = data.tasks.filter(
      (t) => t.status === "Publicado" && daysUntil(t.dueDate) >= -7,
    ).length;
    return {
      open,
      overdue,
      todayTasks,
      week,
      upcomingDates,
      nextPosts,
      pendingApproval,
      active,
      byPerson,
      publishedWeek,
      doneWeek,
    };
  }, [data]);

  const alerts = [
    ...m.overdue.map((t) => ({
      id: `o-${t.id}`,
      tone: "danger" as const,
      text: `Tarea vencida: ${t.name} (${relativeLabel(t.dueDate).toLowerCase()}) — ${t.assignee}`,
    })),
    ...m.pendingApproval.map((p) => ({
      id: `a-${p.id}`,
      tone: "warn" as const,
      text: `Contenido pendiente de aprobación: ${p.title} (${p.channel})`,
    })),
    ...mergeKeyDates(data.keyDates)
      .filter((k) => daysUntil(k.date) >= 0 && daysUntil(k.date) <= k.leadDays)
      .slice(0, 6)
      .map((k) => ({
        id: `k-${k.id}`,
        tone: "warn" as const,
        text: `Prepara "${k.name}": ocurre ${relativeLabel(k.date).toLowerCase()}`,
      })),
    ...data.campaigns
      .filter((c) => daysUntil(c.start) >= 0 && daysUntil(c.start) <= 7)
      .map((c) => ({
        id: `cs-${c.id}`,
        tone: "info" as const,
        text: `La campaña ${c.name} inicia ${relativeLabel(c.start).toLowerCase()}`,
      })),
    ...data.campaigns
      .filter((c) => daysUntil(c.end) >= 0 && daysUntil(c.end) <= 7)
      .map((c) => ({
        id: `ce-${c.id}`,
        tone: "info" as const,
        text: `La campaña ${c.name} termina ${relativeLabel(c.end).toLowerCase()}`,
      })),
  ].slice(0, 8);

  return (
    <AppShell
      title="Buen día, equipo de Marketing"
      subtitle={format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es })}
      actions={
        <button
          onClick={reset}
          className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
        >
          Restaurar demo
        </button>
      }
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={Clock}
          label="Tareas para hoy"
          value={m.todayTasks.length}
          hint={`${m.week.length} esta semana`}
          to="/tareas"
        />
        <Kpi
          icon={AlertTriangle}
          label="Tareas vencidas"
          value={m.overdue.length}
          hint="Requieren atención"
          tone="danger"
          to="/tareas"
        />
        <Kpi
          icon={Send}
          label="Publicaciones próximas"
          value={m.nextPosts.length}
          hint={`${m.pendingApproval.length} por aprobar`}
          to="/contenido"
        />
        <Kpi
          icon={Megaphone}
          label="Campañas activas"
          value={m.active.length}
          hint={`${data.campaigns.length} en total`}
          to="/campanas"
        />
      </section>

      {alerts.length > 0 && (
        <section className="mt-5 rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Recordatorios y alertas</h2>
          <ul className="grid gap-2 md:grid-cols-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  a.tone === "danger"
                    ? "border-destructive/25 bg-destructive/8 text-destructive"
                    : a.tone === "warn"
                      ? "border-warning/35 bg-warning/12 text-warning-foreground"
                      : "border-info/25 bg-info/10 text-info"
                }`}
              >
                {a.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Panel title="Tareas pendientes" to="/tareas" className="lg:col-span-2">
          <ul className="space-y-2">
            {[...m.todayTasks, ...m.overdue, ...m.week].slice(0, 7).map((t) => (
              <li
                key={t.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-surface p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.assignee} · {t.status}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Badge variant="outline" className={priorityClass[t.priority]}>
                    {t.priority}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      daysUntil(t.dueDate) < 0
                        ? "border-destructive/25 bg-destructive/10 text-destructive"
                        : ""
                    }
                  >
                    {relativeLabel(t.dueDate)}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Próximas fechas importantes" to="/fechas">
          <ul className="space-y-2">
            {m.upcomingDates.map((k) => (
              <li key={k.id} className="rounded-xl bg-surface p-3">
                <p className="truncate text-sm font-medium">{k.name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(k.date), "d MMM", { locale: es })} · {relativeLabel(k.date)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Próximas publicaciones" to="/contenido">
          <ul className="space-y-2">
            {m.nextPosts.map((p) => (
              <li key={p.id} className="rounded-xl bg-surface p-3">
                <p className="truncate text-sm font-medium">{p.title}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className={channelClass[p.channel]}>
                    {p.channel}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{relativeLabel(p.date)}</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Actividades por responsable" to="/tareas">
          <ul className="space-y-3">
            {m.byPerson.map((p) => (
              <li key={p.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.total} abiertas {p.late > 0 && `· ${p.late} vencidas`}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, p.total * 20)}
                  className="mt-1.5 h-1.5"
                />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Resumen semanal" to="/calendario">
          <dl className="grid grid-cols-2 gap-3">
            <Summary icon={CheckCircle2} label="Tareas completadas" value={m.doneWeek} />
            <Summary icon={Send} label="Publicaciones enviadas" value={m.publishedWeek} />
            <Summary icon={CalendarClock} label="Vence esta semana" value={m.week.length} />
            <Summary icon={Megaphone} label="Campañas activas" value={m.active.length} />
          </dl>
        </Panel>
      </div>
    </AppShell>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint: string;
  tone?: "danger";
  to: string;
}) {
  return (
    <Link
      to={to}
      className={`rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${
        tone === "danger" && value > 0 ? "border-destructive/40" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="truncate text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p
        className={`mt-2 text-3xl font-bold ${
          tone === "danger" && value > 0 ? "text-destructive" : ""
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}

function Panel({
  title,
  to,
  className = "",
  children,
}: {
  title: string;
  to: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link to={to} className="text-xs font-medium text-primary hover:underline">
          Ver todo
        </Link>
      </div>
      {children}
    </section>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-surface p-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <dd className="mt-1 text-xl font-bold">{value}</dd>
      <dt className="text-xs text-muted-foreground">{label}</dt>
    </div>
  );
}
