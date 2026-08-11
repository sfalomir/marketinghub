import { Link, useRouteContext } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, FileText, Kanban, LayoutDashboard, LogOut, Megaphone, PenSquare, Star, Users } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useMh } from "@/lib/mh-store";
import { logoutFn } from "@/lib/auth";

const nav = [
  { to: "/pdfs", label: "PDFs", icon: FileText },
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tareas", label: "Tareas", icon: Kanban },
  { to: "/calendario", label: "Calendario", icon: CalendarDays },
  { to: "/contenido", label: "Contenido", icon: PenSquare },
  { to: "/campanas", label: "Campañas", icon: Megaphone },
  { to: "/fechas", label: "Fechas importantes", icon: Star },
  { to: "/usuarios", label: "Usuarios", icon: Users },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user } = useRouteContext({ from: "__root__" });
  const { upsertPerson } = useMh();
  const logout = useServerFn(logoutFn);

  useEffect(() => {
    if (!user) return;
    upsertPerson({
      id: user.id,
      name: user.name,
      role: user.role,
    });
  }, [user?.id, user?.name, user?.role, upsertPerson]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-brand/70 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:px-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <Link to="/" className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Megaphone className="h-4.5 w-4.5" />
              </span>
              <span className="truncate text-base font-bold tracking-tight">Marketing Hub</span>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              {actions}
              {user && (
                <div className="flex items-center gap-2">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{user.role}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logout()}
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Salir</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
          <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "bg-primary text-primary-foreground" }}
                inactiveProps={{ className: "text-muted-foreground hover:bg-secondary" }}
                className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <div className="mb-5 grid grid-cols-[minmax(0,1fr)] gap-1">
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
