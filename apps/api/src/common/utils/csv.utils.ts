export function toCsvRow(values: (string | number | boolean | null | undefined)[]): string {
  return values
    .map((v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (s.includes(';') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    })
    .join(';');
}

export function csvWithBom(header: string[], rows: string[][]): string {
  const lines = [toCsvRow(header), ...rows.map((r) => toCsvRow(r))];
  return `\uFEFF${lines.join('\r\n')}`;
}
