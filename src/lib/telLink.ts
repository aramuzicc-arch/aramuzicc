/** Build a safe `tel:` href from a human-entered phone string. */
export function telHref(phone: string): string {
  const t = phone.trim();
  if (!t) return "";
  const normalized = t.replace(/[^\d+]/g, "");
  if (!normalized) return "";
  return `tel:${normalized}`;
}
