import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, width = 640 }: ModalProps) {
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
      <div className="panel panel--modal" style={{ maxWidth: width }} onClick={(event) => event.stopPropagation()}>
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
