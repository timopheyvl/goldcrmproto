import { useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { barGeometry } from './gantt';
import type { TimelineRange } from './gantt';
import { STAGE_STATUS_BADGE, STAGE_STATUS_LABELS } from './types';
import type { Stage } from './types';

export const GANTT_ROW_HEIGHT = 44;

// Бар короче этого % шкалы не даёт места под инлайн-ползунок — тянуть
// физически негде, правим % только через модалку (см. п.4 требований).
const MIN_BAR_WIDTH_FOR_HANDLE = 5;

interface GanttBarProps {
  stage: Stage;
  range: TimelineRange;
  onOpen: (stage: Stage) => void;
  onProgressChange: (stageId: string, progress: number) => void;
  formatDate: (iso: string) => string;
}

export function GanttBar({ stage, range, onOpen, onProgressChange, formatDate }: GanttBarProps) {
  const { left, width } = barGeometry(range, stage);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);

  const displayProgress = dragProgress ?? stage.progress;
  const showHandle = width >= MIN_BAR_WIDTH_FOR_HANDLE;

  const progressFromClientX = (clientX: number): number => {
    const track = trackRef.current;
    if (!track) return stage.progress;
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) return stage.progress;
    const ratio = (clientX - rect.left) / rect.width;
    return Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    draggingRef.current = true;
    movedRef.current = false;
    setDragProgress(stage.progress);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    movedRef.current = true;
    setDragProgress(progressFromClientX(event.clientX));
  };

  const commitDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    event.stopPropagation();
    draggingRef.current = false;
    const finalValue = movedRef.current ? progressFromClientX(event.clientX) : stage.progress;
    setDragProgress(null);
    if (movedRef.current) {
      onProgressChange(stage.id, finalValue);
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      const delta = event.key === 'ArrowLeft' ? -5 : 5;
      onProgressChange(stage.id, Math.min(100, Math.max(0, stage.progress + delta)));
    }
  };

  const handleBarClick = () => {
    // Клик, случившийся сразу после драга ползунка, не должен открывать панель деталей.
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    onOpen(stage);
  };

  return (
    <div className="gantt__timeline-row" style={{ height: GANTT_ROW_HEIGHT }}>
      <div
        className={`gantt-bar gantt-bar--${STAGE_STATUS_BADGE[stage.status]}`}
        style={{ left: `${left}%`, width: `${width}%` }}
        role="button"
        tabIndex={0}
        onClick={handleBarClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onOpen(stage);
        }}
      >
        <div className="gantt-bar__inner" ref={trackRef}>
          <span className="gantt-bar__progress" style={{ width: `${displayProgress}%` }} />
        </div>

        {showHandle && (
          <div
            className="gantt-bar__handle"
            style={{ left: `${displayProgress}%` }}
            role="slider"
            aria-label={`Процент выполнения этапа «${stage.name}»`}
            aria-valuenow={displayProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={commitDrag}
            onPointerCancel={commitDrag}
            onKeyDown={handleKeyDown}
            title="Потяните, чтобы изменить % выполнения"
          />
        )}

        <span className="gantt-bar__label">{displayProgress}%</span>

        <div className="gantt-bar__tooltip">
          <div className="gantt-bar__tooltip-title">{stage.name}</div>
          <div className="gantt-bar__tooltip-row">
            {formatDate(stage.startDate)} — {formatDate(stage.endDate)}
          </div>
          <div className="gantt-bar__tooltip-row">Ответственный: {stage.assignee || '—'}</div>
          <div className="gantt-bar__tooltip-row">
            {STAGE_STATUS_LABELS[stage.status]} · {displayProgress}%
          </div>
        </div>
      </div>
    </div>
  );
}
