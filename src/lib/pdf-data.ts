export type PdfFields = {
  emails: string[];
  phones: string[];
  urls: string[];
  dates: string[];
  amounts: string[];
};

function unique(values: string[]) {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}

export function extractFields(text: string): PdfFields {
  const emails = unique(text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []);
  const phones = unique(
    (text.match(/(?:\+52\s*)?(?:\(?\d{2,3}\)?[\s.-]?)\d{3,4}[\s.-]?\d{4}/g) ?? []).filter(
      (p) => p.replace(/\D/g, "").length >= 10,
    ),
  );
  const urls = unique(text.match(/https?:\/\/[^\s)>\]]+/gi) ?? []);
  const dates = unique(
    text.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/g) ?? [],
  );
  const amounts = unique(
    text.match(
      /(?:\$|MXN|USD)\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s?(?:MXN|USD)/gi,
    ) ?? [],
  );

  return { emails, phones, urls, dates, amounts };
}
