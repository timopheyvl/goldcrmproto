export interface RepresentativeInput {
  fullName: string;
  email: string;
  phone: string;
  position: string;
}

export interface MaterialFileMeta {
  id: string;
  name: string;
  uploadedAt: string;
}

export interface MaterialRecord {
  id: string;
  siteId: string;
  name: string;
  description: string;
  createdAt: string;
  files: MaterialFileMeta[];
}

export type StageStatus = 'planned' | 'in_progress' | 'done' | 'delayed';

export const STAGE_STATUSES: StageStatus[] = ['planned', 'in_progress', 'done', 'delayed'];

export const STAGE_STATUS_LABELS: Record<StageStatus, string> = {
  planned: 'Запланирован',
  in_progress: 'В работе',
  done: 'Выполнен',
  delayed: 'Отложен',
};

// Те же пилюли-статусы (status-badge / status-pill), что и в остальном проекте.
export const STAGE_STATUS_BADGE: Record<StageStatus, string> = {
  planned: 'neutral',
  in_progress: 'warning',
  done: 'ok',
  delayed: 'error',
};

export interface StageFileMeta {
  id: string;
  name: string;
  uploadedAt: string;
}

export interface Stage {
  id: string;
  siteId: string;
  name: string;
  description: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
  status: StageStatus;
  assignee: string;
  /** 0..100 */
  progress: number;
  /** Id этапа, от которого зависит текущий, либо null. */
  dependsOn: string | null;
  files: StageFileMeta[];
  /** Id заявок, привязанных к этапу — мок-связь для демонстрации в панели
   * деталей и как одно из условий блокировки удаления. Реальной связи
   * Заявка↔Этап_работ в доменной модели нет, задаётся вручную менеджером. */
  requestIds: string[];
}

export interface StageInput {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: StageStatus;
  assignee: string;
  progress: number;
  dependsOn: string | null;
  requestIds: string[];
}

/** Поля, доступные представителю при редактировании этапа. */
export interface StageLimitedInput {
  description: string;
  status: StageStatus;
  progress: number;
  assignee: string;
}
