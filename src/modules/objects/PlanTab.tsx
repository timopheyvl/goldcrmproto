import { useEffect, useMemo, useState } from 'react';
import { useRole } from '../../context/useRole';
import { useObjects } from './useObjects';
import { GanttChart } from './GanttChart';
import { MobileStageList } from './MobileStageList';
import { StagePanel } from './StagePanel';
import { StageFormModal } from './StageFormModal';
import { STAGE_STATUSES, STAGE_STATUS_LABELS } from './types';
import type { StageStatus } from './types';
import './objects.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU');
}

interface PlanTabProps {
  siteId: string;
}

export function PlanTab({ siteId }: PlanTabProps) {
  const { role } = useRole();
  const isManager = role === 'manager';
  const { getStagesBySite, updateStageProgress } = useObjects();
  const stages = getStagesBySite(siteId);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timeout);
  }, [siteId]);

  const [statusFilter, setStatusFilter] = useState<StageStatus[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Храним только id — сам этап всегда достаём заново из живого списка stages,
  // чтобы открытая панель сразу отражала любые изменения (включая инлайн-драг
  // прогресса на баре) без отдельной синхронизации.
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const selectedStage = stages.find((stage) => stage.id === selectedStageId) ?? null;

  const [formOpen, setFormOpen] = useState(false);

  const assigneeOptions = useMemo(() => {
    const names = new Set(stages.map((stage) => stage.assignee).filter(Boolean));
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [stages]);

  const toggleStatus = (status: StageStatus) => {
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status]));
  };

  const filteredStages = useMemo(() => {
    return stages.filter((stage) => {
      if (statusFilter.length > 0 && !statusFilter.includes(stage.status)) return false;
      if (assigneeFilter && stage.assignee !== assigneeFilter) return false;
      if (dateFrom && stage.endDate < dateFrom) return false;
      if (dateTo && stage.startDate > dateTo) return false;
      return true;
    });
  }, [stages, statusFilter, assigneeFilter, dateFrom, dateTo]);

  const filtersActive = statusFilter.length > 0 || Boolean(assigneeFilter) || Boolean(dateFrom) || Boolean(dateTo);

  const resetFilters = () => {
    setStatusFilter([]);
    setAssigneeFilter('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="plan-tab">
      <div className="plan-tab__toolbar">
        <div className="status-pills">
          {STAGE_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={statusFilter.includes(status) ? 'status-pill status-pill--active' : 'status-pill'}
              onClick={() => toggleStatus(status)}
            >
              {STAGE_STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        <div className="plan-tab__toolbar-row">
          <select className="filter-select" value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)}>
            <option value="">Все ответственные</option>
            {assigneeOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="filter-date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            aria-label="Дата с"
          />
          <span className="requests-page__date-separator">—</span>
          <input
            type="date"
            className="filter-date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            aria-label="Дата по"
          />
          {filtersActive && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={resetFilters}>
              Сбросить фильтры
            </button>
          )}
          {isManager && (
            <button type="button" className="btn btn--primary plan-tab__add" onClick={() => setFormOpen(true)}>
              Добавить этап
            </button>
          )}
        </div>
      </div>

      <p className="gantt__stub-note">
        Перетаскивание дат на диаграмме, автоматический пересчёт по зависимостям и линии критического пути — в
        реализации на библиотеке svar.dev.
      </p>

      {loading ? (
        <div className="gantt-skeleton">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="skeleton-bar" key={index} />
          ))}
        </div>
      ) : stages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">Этапов пока нет</div>
          <p>
            {isManager
              ? 'Добавьте первый этап плана работ для этого объекта.'
              : 'Этапы появятся здесь после того как менеджер сформирует план работ.'}
          </p>
        </div>
      ) : (
        <>
          <div className="gantt-desktop-wrap">
            <GanttChart
              allStages={stages}
              visibleStages={filteredStages}
              onStageClick={(stage) => setSelectedStageId(stage.id)}
              onProgressChange={updateStageProgress}
              formatDate={formatDate}
            />
          </div>
          <div className="gantt-mobile-wrap">
            <MobileStageList
              stages={filteredStages}
              formatDate={formatDate}
              onStageClick={(stage) => setSelectedStageId(stage.id)}
            />
          </div>
        </>
      )}

      <StagePanel stage={selectedStage} onClose={() => setSelectedStageId(null)} />

      <StageFormModal open={formOpen} onClose={() => setFormOpen(false)} siteId={siteId} />
    </div>
  );
}
