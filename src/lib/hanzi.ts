export interface DataHanzi { strokes: string[] }

/** Aksara utuh sebagai SVG statis: tampil sebelum JavaScript jalan, dan tetap untuk "kurangi gerakan". */
export function svgHanzi(data: DataHanzi): string {
  const jalur = data.strokes.map((d) => `<path d="${d}"/>`).join('');
  return `<svg viewBox="0 0 1024 1024" aria-hidden="true" focusable="false"><g transform="translate(0, 900) scale(1, -1)">${jalur}</g></svg>`;
}
