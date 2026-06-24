export function normalizeLeetcodeUrl(value?: string | null): string | null {
  if (!value) return null;
  const repaired = value.trim().replace(/^httpshttps:\/\//i, 'https://');
  try {
    const parsed = new URL(repaired);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const match = parsed.pathname.match(/^\/problems\/([a-z0-9-]+)\/?$/i);
    if (parsed.protocol !== 'https:' || hostname !== 'leetcode.com' || !match) {
      return null;
    }
    return `https://leetcode.com/problems/${match[1].toLowerCase()}/`;
  } catch {
    return null;
  }
}
