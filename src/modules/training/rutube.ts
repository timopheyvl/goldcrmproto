/** Превращает ссылку на Rutube-видео в embed-URL для iframe. Понимает как
 * обычные ссылки вида /video/<id>/, так и уже готовые /play/embed/<id>/.
 * Возвращает null, если ссылка не похожа на rutube.ru — сохранять её тогда
 * бессмысленно, редактор покажет ошибку. */
export function parseRutubeEmbedUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (!parsed.hostname.replace(/^www\./, '').endsWith('rutube.ru')) return null;

  const embedMatch = parsed.pathname.match(/\/play\/embed\/([a-zA-Z0-9]+)/);
  if (embedMatch) return `https://rutube.ru/play/embed/${embedMatch[1]}/`;

  const videoMatch = parsed.pathname.match(/\/video\/([a-zA-Z0-9]+)/);
  if (videoMatch) return `https://rutube.ru/play/embed/${videoMatch[1]}/`;

  return null;
}
