/**
 * New accounts default their display name to the part of the email before the @.
 * Don't prefill that into anything public: it leaks part of someone's email.
 */
export function usableName(name: string | null | undefined, email: string | null | undefined): string {
  const n = (name || '').trim();
  if (!n) return '';
  const prefix = (email || '').split('@')[0]?.toLowerCase();
  if (prefix && n.toLowerCase() === prefix) return '';
  return n;
}
