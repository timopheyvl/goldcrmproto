import { useEffect, useState } from 'react';

// Тот же брейкпоинт, что и переключение диаграммы/списка в objects.css.
const QUERY = '(max-width: 768px)';

/** Единственное место, где нужно знать десктоп/мобильный вид в JS (не только
 * в CSS) — панель этапа должна становиться read-only на мобильном. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const sync = () => setIsMobile(mql.matches);
    // matchMedia 'change' — основной путь; 'resize' — подстраховка на случай,
    // если смена viewport не породила событие change (например, в некоторых
    // средах эмуляции viewport).
    mql.addEventListener('change', sync);
    window.addEventListener('resize', sync);
    return () => {
      mql.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  return isMobile;
}
