import { createContext } from 'react';
import type { Department, Representative, Site } from '../../data/org';
import type { MaterialRecord, RepresentativeInput, Stage, StageInput, StageLimitedInput } from './types';

export interface DeleteGuardResult {
  allowed: boolean;
  reason?: string;
}

export interface ObjectsContextValue {
  sites: Site[];
  /** Создание объекта — только модуль «Управление», привязка к заказчику из контекста. */
  addSite: (customerId: string, input: Omit<Site, 'id' | 'customerId'>) => string;
  updateSite: (siteId: string, patch: Partial<Omit<Site, 'id' | 'customerId'>>) => void;
  canDeleteSite: (siteId: string) => DeleteGuardResult;
  deleteSite: (siteId: string) => void;

  departments: Department[];
  getDepartmentsBySite: (siteId: string) => Department[];
  /** Создание службы — модуль «Управление», привязка к объекту из контекста. */
  addDepartment: (siteId: string, name: string) => string;
  updateDepartment: (departmentId: string, name: string) => void;
  canDeleteDepartment: (departmentId: string) => DeleteGuardResult;
  deleteDepartment: (departmentId: string) => void;

  representatives: Representative[];
  getRepresentativesByDepartment: (departmentId: string) => Representative[];
  /** Создание представителя — привязка к службе из контекста, после создания не меняется. */
  addRepresentative: (departmentId: string, input: RepresentativeInput) => string;
  updateRepresentative: (representativeId: string, patch: Partial<RepresentativeInput>) => void;
  /** Мягкое отключение — не удаление; связи и история сохраняются. */
  setRepresentativeActive: (representativeId: string, active: boolean) => void;
  canDeleteRepresentative: (representativeId: string) => DeleteGuardResult;
  deleteRepresentative: (representativeId: string) => void;

  materials: MaterialRecord[];
  getMaterialsBySite: (siteId: string) => MaterialRecord[];
  addMaterial: (siteId: string, input: { name: string; description: string }, files: File[]) => void;
  updateMaterial: (materialId: string, input: { name: string; description: string }) => void;
  deleteMaterial: (materialId: string) => void;
  addFilesToMaterial: (materialId: string, files: File[]) => void;
  /** Прикреплённые файлы хранятся только в памяти текущей сессии — после
   * перезагрузки страницы метаданные останутся, а содержимое будет недоступно
   * для скачивания. Бэкенда/объектного хранилища в прототипе нет. */
  removeMaterialFile: (materialId: string, fileId: string) => void;
  getMaterialFile: (fileId: string) => File | undefined;

  stages: Stage[];
  getStagesBySite: (siteId: string) => Stage[];
  /** Создание этапа — менеджер, отдельная модалка (все поля сразу). */
  addStage: (siteId: string, input: StageInput) => void;
  /** Точечное автосохранение поля/полей этапа менеджером — единая панель
   * этапа патчит только изменившееся поле, а не всю сущность целиком. */
  updateStage: (stageId: string, patch: Partial<StageInput>) => void;
  /** То же самое для представителя — patch ограничен полями StageLimitedInput
   * на уровне UI (панель не даёт представителю трогать остальное). */
  updateStageLimited: (stageId: string, patch: Partial<StageLimitedInput>) => void;
  /** Точечное быстрое обновление % выполнения — инлайн-ползунок на баре и
   * ползунок в панели; доступно и менеджеру, и представителю (0..100,
   * округляется/зажимается внутри). */
  updateStageProgress: (stageId: string, progress: number) => void;
  canDeleteStage: (stageId: string) => DeleteGuardResult;
  deleteStage: (stageId: string) => void;
  addFilesToStage: (stageId: string, files: File[]) => void;
  removeStageFile: (stageId: string, fileId: string) => void;
  getStageFile: (fileId: string) => File | undefined;
}

export const ObjectsContext = createContext<ObjectsContextValue | null>(null);
