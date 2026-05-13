/** Public site URL from `VITE_SITE_URL` (e.g. https://aramuzicc.vercel.app). No trailing slash. */
export function getSiteUrl(): string {
  const raw = import.meta.env.VITE_SITE_URL as string | undefined;
  if (!raw?.trim()) return "";
  return raw.trim().replace(/\/$/, "");
}
