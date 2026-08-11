import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { extractFields, type PdfFields } from "./pdf-data";

const MAX_BYTES = 8 * 1024 * 1024;

export type PdfExtractResult = {
  filename: string;
  pages: number;
  text: string;
  fields: PdfFields;
};

export const extractPdfFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        filename: z.string().trim().min(1).max(200),
        base64: z.string().min(20).max(12_000_000),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<PdfExtractResult> => {
    const raw = data.base64.includes(",") ? data.base64.split(",")[1]! : data.base64;
    const bytes = Uint8Array.from(Buffer.from(raw, "base64"));

    if (bytes.byteLength > MAX_BYTES) {
      throw new Error("El PDF no puede pesar más de 8 MB.");
    }

    const { extractText } = await import("unpdf");
    const extracted = await extractText(bytes, { mergePages: true });
    const text = extracted.text.trim();

    if (!text) {
      throw new Error("No se pudo leer texto de este PDF. Puede estar escaneado o protegido.");
    }

    return {
      filename: data.filename,
      pages: extracted.totalPages,
      text,
      fields: extractFields(text),
    };
  });
