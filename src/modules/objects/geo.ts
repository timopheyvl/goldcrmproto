/** Объект хранит геопозицию строкой "широта, долгота" (см. src/data/org.ts). */
export function parseGeo(geo: string): { lat: number; lng: number } | null {
  const parts = geo.split(',').map((part) => Number(part.trim()));
  if (parts.length !== 2 || parts.some((value) => Number.isNaN(value))) return null;
  const [lat, lng] = parts;
  return { lat, lng };
}

export function buildYandexMapsUrl(geo: string): string | null {
  const parsed = parseGeo(geo);
  if (!parsed) return null;
  return `https://yandex.ru/maps/?pt=${parsed.lng},${parsed.lat}&z=16&l=map`;
}
