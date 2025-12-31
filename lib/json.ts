export function toPlain<T = any>(data: T): any {
  if (data === null || data === undefined) return data;
  const t = typeof data as string;
  if (t === 'bigint') return (data as unknown as bigint).toString();
  if (Array.isArray(data)) return data.map((v) => toPlain(v));
  if (data instanceof Date) return data; // let Next serialize Date → ISO string
  if (t === 'object') {
    const anyData = data as any;
    // Handle objects with toJSON (e.g., Prisma Decimal) safely
    if (typeof anyData.toJSON === 'function') {
      try {
        return toPlain(anyData.toJSON());
      } catch {
        // fallthrough to plain copy
      }
    }
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(anyData)) out[k] = toPlain(v);
    return out;
  }
  return data;
}
