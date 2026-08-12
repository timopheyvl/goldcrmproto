import { computeTimelineRange, monthTicks, todayPercent } from './gantt';
import { GanttBar, GANTT_ROW_HEIGHT } from './GanttBar';
import { STAGE_STATUS_BADGE } from './types';
import type { Stage } from './types';
import './objects.css';

interface GanttChartProps {
  /** Все этапы объекта — используются только для расчёта диапазона шкалы. */
  allStages: Stage[];
  /** Этапы, которые нужно отрисовать (после фильтров). */
  visibleStages: Stage[];
  onStageClick: (stage: Stage) => void;
  onProgressChange: (stageId: string, progress: number) => void;
  formatDate: (iso: string) => string;
}

export function GanttChart({ allStages, visibleStages, onStageClick, onProgressChange, formatDate }: GanttChartProps) {
  const range = computeTimelineRange(allStages);
  if (!range) return null;

  if (visibleStages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__title">Ничего не найдено</div>
        <p>По выбранным фильтрам этапов не найдено.</p>
      </div>
    );
  }

  const ticks = monthTicks(range);
  const todayPct = todayPercent(range);

  return (
    <div className="gantt">
      <div className="gantt__labels">
        <div className="gantt__labels-header" />
        {visibleStages.map((stage) => (
          <button
            type="button"
            className="gantt__label-row"
            key={stage.id}
            style={{ height: GANTT_ROW_HEIGHT }}
            onClick={() => onStageClick(stage)}
          >
            <span className={`status-dot status-dot--${STAGE_STATUS_BADGE[stage.status]}`} aria-hidden="true" />
            <span className="gantt__label-name">{stage.name}</span>
          </button>
        ))}
      </div>

      <div className="gantt__timeline">
        <div className="gantt__timeline-header">
          {ticks.map((tick) => (
            <div className="gantt__tick" key={`${tick.label}-${tick.percent}`} style={{ left: `${tick.percent}%` }}>
              {tick.label}
            </div>
          ))}
        </div>

        <div className="gantt__timeline-body">
          {todayPct !== null && (
            <div className="gantt__today-line" style={{ left: `${todayPct}%` }} title="Сегодня" />
          )}
          {visibleStages.map((stage) => (
            <GanttBar
              key={stage.id}
              stage={stage}
              range={range}
              onOpen={onStageClick}
              onProgressChange={onProgressChange}
              formatDate={formatDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
