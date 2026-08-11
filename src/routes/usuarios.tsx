import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Building2,
  Eye,
  EyeOff,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/mh/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  listUsersFn,
  createUserAdminFn,
  updateUserFn,
  deleteUserFn,
} from "@/lib/user-admin";
import type { User, UserRole, UserStatus } from "@/lib/supabase-types";

export const Route = createFileRoute("/usuarios")({
  head: () => ({
    meta: [
      { title: "Gestión de usuarios | Marketing Hub" },
      {
        name: "description",
        content: "Administra los usuarios del equipo con roles, estados y datos de contacto.",
      },
    ],
  }),
  component: UsuariosPage,
});

// ── Schemas ──────────────────────────────────────────────────────────────────

const baseSchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(80, "Máximo 80"),
  last_name: z.string().trim().min(2, "Mínimo 2 caracteres").max(80, "Máximo 80"),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().max(20, "Máximo 20 caracteres").optional().default(""),
  company: z.string().trim().max(100, "Máximo 100 caracteres").optional().default(""),
  job_title: z.string().trim().max(100, "Máximo 100 caracteres").optional().default(""),
  role: z.enum(["Administrador", "Marketing", "Colaborador"] as const),
  status: z.enum(["Activo", "Inactivo", "Suspendido"] as const),
  avatar_url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\/.+/.test(v), {
      message: "Debe ser una URL válida (https://…) o dejar vacío",
    })
    .optional()
    .default(""),
});

const createSchema = baseSchema.extend({
  password: z.string().min(8, "Mínimo 8 caracteres").max(100, "Máximo 100"),
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof baseSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<UserRole, string> = {
  Administrador: "bg-destructive/10 text-destructive border-destructive/25",
  Marketing: "bg-primary/10 text-primary border-primary/25",
  Colaborador: "bg-secondary text-secondary-foreground border-border",
};

const STATUS_COLORS: Record<UserStatus, string> = {
  Activo: "bg-success/12 text-success border-success/25",
  Inactivo: "bg-warning/15 text-warning-foreground border-warning/30",
  Suspendido: "bg-destructive/10 text-destructive border-destructive/25",
};

function initials(name: string, last: string) {
  return `${name[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "dd MMM yyyy", { locale: es });
  } catch {
    return "—";
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "Todos">("Todos");
  const [filterStatus, setFilterStatus] = useState<UserStatus | "Todos">("Todos");

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  const listUsers = useServerFn(listUsersFn);
  const createUser = useServerFn(createUserAdminFn);
  const updateUser = useServerFn(updateUserFn);
  const deleteUserFn_ = useServerFn(deleteUserFn);

  const load = async () => {
    try {
      const data = await listUsers();
      setUsers(data);
    } catch {
      toast.error("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.company.toLowerCase().includes(q);
      const matchRole = filterRole === "Todos" || u.role === filterRole;
      const matchStatus = filterStatus === "Todos" || u.status === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  // ── Create form ──
  const createForm = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "", last_name: "", email: "", password: "",
      phone: "", company: "", job_title: "",
      role: "Colaborador", status: "Activo", avatar_url: "",
    },
  });

  // ── Edit form ──
  const editForm = useForm<EditForm>({
    resolver: zodResolver(baseSchema),
  });

  useEffect(() => {
    if (editUser) {
      editForm.reset({
        name: editUser.name,
        last_name: editUser.last_name,
        email: editUser.email,
        phone: editUser.phone,
        company: editUser.company,
        job_title: editUser.job_title,
        role: editUser.role,
        status: editUser.status,
        avatar_url: editUser.avatar_url,
      });
    }
  }, [editUser, editForm]);

  // ── Handlers ──

  async function handleCreate(values: CreateForm) {
    setSaving(true);
    try {
      const res = await createUser({ data: values });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setUsers((prev) => [res.user, ...prev]);
      toast.success(`Usuario ${res.user.name} ${res.user.last_name} creado`);
      setCreateOpen(false);
      createForm.reset();
    } catch {
      toast.error("Error al crear el usuario");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(values: EditForm) {
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await updateUser({ data: { ...values, id: editUser.id } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? res.user : u)));
      toast.success("Usuario actualizado");
      setEditUser(null);
    } catch {
      toast.error("Error al actualizar el usuario");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteUser) return;
    setSaving(true);
    try {
      const res = await deleteUserFn_({ data: { id: deleteUser.id } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      toast.success(`Usuario ${deleteUser.name} ${deleteUser.last_name} eliminado`);
      setDeleteUser(null);
    } catch {
      toast.error("Error al eliminar el usuario");
    } finally {
      setSaving(false);
    }
  }

  // ── Render ──

  return (
    <AppShell
      title="Gestión de usuarios"
      subtitle={`${users.length} usuario${users.length !== 1 ? "s" : ""} registrados`}
      actions={
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </Button>
      }
    >
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o empresa…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterRole} onValueChange={(v) => setFilterRole(v as UserRole | "Todos")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los roles</SelectItem>
            <SelectItem value="Administrador">Administrador</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Colaborador">Colaborador</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as UserStatus | "Todos")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los estados</SelectItem>
            <SelectItem value="Activo">Activo</SelectItem>
            <SelectItem value="Inactivo">Inactivo</SelectItem>
            <SelectItem value="Suspendido">Suspendido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Users className="mr-2 h-5 w-5 animate-pulse" />
          Cargando usuarios…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-20 text-center text-muted-foreground">
          <UserCircle className="h-10 w-10 opacity-40" />
          <p className="text-sm font-medium">Sin resultados</p>
          <p className="text-xs">Prueba otro filtro o crea un nuevo usuario</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-10" />
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Empresa / Puesto</TableHead>
                <TableHead className="hidden sm:table-cell">Teléfono</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden lg:table-cell">Registro</TableHead>
                <TableHead className="hidden lg:table-cell">Último acceso</TableHead>
                <TableHead className="w-20 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatar_url} alt={u.name} />
                      <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                        {initials(u.name, u.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium leading-none">{u.name} {u.last_name}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {u.company || u.job_title ? (
                      <div>
                        {u.company && (
                          <p className="flex items-center gap-1 text-sm font-medium">
                            <Building2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                            {u.company}
                          </p>
                        )}
                        {u.job_title && (
                          <p className="text-xs text-muted-foreground">{u.job_title}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {u.phone ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {u.phone}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${ROLE_COLORS[u.role]}`}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${STATUS_COLORS[u.status]}`}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {fmtDate(u.created_at)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {fmtDate(u.last_access)}
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditUser(u)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteUser(u)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Create dialog ── */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!saving) { setCreateOpen(o); if (!o) createForm.reset(); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <UserFields form={createForm} />
              {/* Password */}
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPass ? "text" : "password"}
                          placeholder="Mínimo 8 caracteres"
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Creando…" : "Crear usuario"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ── */}
      <Dialog open={!!editUser} onOpenChange={(o) => { if (!saving && !o) setEditUser(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <UserFields form={editForm} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditUser(null)} disabled={saving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando…" : "Guardar cambios"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deleteUser} onOpenChange={(o) => { if (!saving && !o) setDeleteUser(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a{" "}
              <strong>{deleteUser?.name} {deleteUser?.last_name}</strong> ({deleteUser?.email}).
              No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? "Eliminando…" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

// ── Shared field group ────────────────────────────────────────────────────────

function UserFields({ form }: { form: ReturnType<typeof useForm<any>> }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Ana" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido *</FormLabel>
              <FormControl>
                <Input placeholder="Rivera" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input type="email" placeholder="ana@empresa.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="+52 55 1234 5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Empresa S.A." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="job_title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Puesto</FormLabel>
            <FormControl>
              <Input placeholder="Directora de Marketing" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Colaborador">Colaborador</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                  <SelectItem value="Suspendido">Suspendido</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="avatar_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Foto (URL)</FormLabel>
            <FormControl>
              <Input type="url" placeholder="https://ejemplo.com/foto.jpg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
