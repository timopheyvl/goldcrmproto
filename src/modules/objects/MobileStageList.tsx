import { STAGE_STATUS_BADGE, STAGE_STATUS_LABELS } from './types';
import type { Stage } from './types';
import './objects.css';

interface MobileStageListProps {
  stages: Stage[];
  formatDate: (iso: string) => string;
  onStageClick: (stage: Stage) => void;
}

/** Упрощённый список этапов для узких вьюпортов — по ТЗ диаграмма на мобильном
 * не показывается. Клик по карточке открывает ту же панель этапа, что и на
 * десктопе, но она сама уходит в режим «только просмотр» (см. useIsMobile). */
export function MobileStageList({ stages, formatDate, onStageClick }: MobileStageListProps) {
  if (stages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__title">Ничего не найдено</div>
        <p>По выбранным фильтрам этапов не найдено.</p>
      </div>
    );
  }

  return (
    <div className="mobile-stage-list">
      {stages.map((stage) => (
        <div
          className="mobile-stage-card"
          key={stage.id}
          role="button"
          tabIndex={0}
          onClick={() => onStageClick(stage)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onStageClick(stage);
          }}
        >
          <div className="mobile-stage-card__header">
            <span className="mobile-stage-card__name">{stage.name}</span>
            <span className={`status-badge status-badge--${STAGE_STATUS_BADGE[stage.status]}`}>
              {STAGE_STATUS_LABELS[stage.status]}
            </span>
          </div>
          <div className="mobile-stage-card__dates">
            {formatDate(stage.startDate)} — {formatDate(stage.endDate)}
          </div>
          <div className="mobile-stage-card__assignee">Ответственный: {stage.assignee || '—'}</div>
        </div>
      ))}
    </div>
  );
}
