import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from "react";
import { AppShell } from "@/components/mh/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { extractPdfFn, type PdfExtractResult } from "@/lib/pdf";

const STORAGE_KEY = "marketing-hub-pdfs-v1";
const MAX_HISTORY = 12;

type PdfDoc = PdfExtractResult & { id: string; createdAt: string };

export const Route = createFileRoute("/pdfs")({
  head: () => ({
    meta: [
      { title: "PDFs | Marketing Hub" },
      {
        name: "description",
        content: "Sube PDFs, léelos y extrae correos, teléfonos, fechas, montos y enlaces.",
      },
    ],
  }),
  component: PdfsPage,
});

function PdfsPage() {
  const extractPdf = useServerFn(extractPdfFn);
  const inputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<PdfDoc[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PdfDoc[];
      setDocs(parsed);
      setActiveId(parsed[0]?.id ?? null);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    } catch {
      /* ignore */
    }
  }, [docs]);

  const active = useMemo(() => docs.find((d) => d.id === activeId) ?? null, [docs, activeId]);

  async function handleFile(file: File) {
    setError(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Solo se aceptan archivos PDF.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("El PDF no puede pesar más de 8 MB.");
      return;
    }

    setPending(true);
    try {
      const base64 = await fileToBase64(file);
      const result = await extractPdf({ data: { filename: file.name, base64 } });
      const doc: PdfDoc = {
        ...result,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setDocs((prev) => [doc, ...prev].slice(0, MAX_HISTORY));
      setActiveId(doc.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo leer el PDF.");
    } finally {
      setPending(false);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (file) void handleFile(file);
  }

  return (
    <AppShell
      title="PDFs"
      subtitle="Sube un PDF para leerlo y extraer correos, teléfonos, fechas, montos y enlaces."
    >
      <form onSubmit={onSubmit} className="mb-6">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
        >
          <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Arrastra un PDF aquí o haz clic para seleccionarlo</p>
          <p className="mt-1 text-xs text-muted-foreground">Máximo 8 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </label>
        {error && (
          <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {pending && <p className="mt-3 text-sm text-muted-foreground">Leyendo PDF…</p>}
      </form>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3 text-sm font-medium">Documentos</div>
          {docs.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Aún no has subido PDFs.</p>
          ) : (
            <ul className="max-h-[520px] overflow-auto p-2">
              {docs.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(doc.id)}
                    className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                      doc.id === activeId ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                    }`}
                  >
                    <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{doc.filename}</span>
                      <span className="block text-xs opacity-80">{doc.pages} pág.</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="rounded-xl border border-border bg-card p-5">
          {!active ? (
            <p className="text-sm text-muted-foreground">Selecciona un PDF para ver los datos extraídos.</p>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{active.filename}</h2>
                  <p className="text-sm text-muted-foreground">{active.pages} páginas</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDocs((prev) => prev.filter((d) => d.id !== active.id));
                    setActiveId(docs.find((d) => d.id !== active.id)?.id ?? null);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Quitar
                </Button>
              </div>

              <FieldGroup title="Correos" items={active.fields.emails} />
              <FieldGroup title="Teléfonos" items={active.fields.phones} />
              <FieldGroup title="Fechas" items={active.fields.dates} />
              <FieldGroup title="Montos" items={active.fields.amounts} />
              <FieldGroup title="Enlaces" items={active.fields.urls} />

              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Texto extraído</p>
                <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-lg bg-secondary p-4 text-sm leading-relaxed">
                  {active.text}
                </pre>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function FieldGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin datos</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result ?? "");
      resolve(value.includes(",") ? value.split(",")[1]! : value);
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}
