/** Drop keys whose value is `undefined` (JSON merge helper for tool `extra` payloads). */
export const omitUndefined = (
  r: Record<string, unknown>
): Record<string, unknown> =>
  Object.fromEntries(Object.entries(r).filter(([, v]) => v !== undefined));
