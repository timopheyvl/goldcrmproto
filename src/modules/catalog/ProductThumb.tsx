function hashHue(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 360;
  }
  return hash;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function ProductThumb({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const hue = hashHue(name);
  return (
    <div
      className={`product-thumb product-thumb--${size}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 92%), hsl(${hue} 60% 82%))`, color: `hsl(${hue} 45% 32%)` }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
