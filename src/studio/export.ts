import type { Renderer } from '../renderers/dom.js';
export function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace(/[\x00-\x1f\x7f/\\:*?"<>|]/g, '-');
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportSvg(renderer: Renderer | null, filename: string): boolean {
  renderer?.settle();
  const svg = renderer?.element.querySelector('svg.vf-chart');
  if (!svg) return false;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('font-family', 'system-ui, sans-serif');
  download(new XMLSerializer().serializeToString(clone), filename, 'image/svg+xml');
  return true;
}
