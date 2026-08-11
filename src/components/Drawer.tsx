import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number;
}

export function Drawer({ open, onClose, title, children, width = 420 }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="panel panel--drawer"
        style={{ width }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel__header">
          {title && <h2 className="panel__title">{title}</h2>}
          <button type="button" className="panel__close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className="panel__body">{children}</div>
      </div>
    </div>
  );
}
