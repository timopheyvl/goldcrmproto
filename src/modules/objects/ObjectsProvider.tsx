import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ObjectsContext } from './ObjectsContext';
import type { ObjectsContextValue } from './ObjectsContext';
import { SEED_MATERIALS } from './data';
import { SEED_STAGES } from './stagesData';
import type { MaterialFileMeta, MaterialRecord, Stage } from './types';
import { DEPARTMENTS, REPRESENTATIVES, SITES } from '../../data/org';
import type { Department, Representative, Site } from '../../data/org';
import { useRequests } from '../requests/useRequests';

const SITES_STORAGE_KEY = 'goldlink.objects.sites';
const DEPARTMENTS_STORAGE_KEY = 'goldlink.objects.departments';
const REPRESENTATIVES_STORAGE_KEY = 'goldlink.objects.representatives';
const MATERIALS_STORAGE_KEY = 'goldlink.objects.materials';
const STAGES_STORAGE_KEY = 'goldlink.objects.stages';

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ObjectsProvider({ children }: { children: ReactNode }) {
  const { requests } = useRequests();

  const [sites, setSites] = useState<Site[]>(() => readStored(SITES_STORAGE_KEY, SITES));
  const [departments, setDepartments] = useState<Department[]>(() => readStored(DEPARTMENTS_STORAGE_KEY, DEPARTMENTS));
  const [representatives, setRepresentatives] = useState<Representative[]>(() =>
    readStored(REPRESENTATIVES_STORAGE_KEY, REPRESENTATIVES),
  );
  const [materials, setMaterials] = useState<MaterialRecord[]>(() => readStored(MATERIALS_STORAGE_KEY, SEED_MATERIALS));
  const [stages, setStages] = useState<Stage[]>(() => readStored(STAGES_STORAGE_KEY, SEED_STAGES));

  // Содержимое загруженных файлов материалов и этапов живёт только в памяти
  // текущей вкладки — File не сериализуется в localStorage, там остаются
  // только метаданные (см. эффекты ниже). После перезагрузки страницы карта пуста.
  const fileStoreRef = useRef<Map<string, File>>(new Map());

  useEffect(() => {
    window.localStorage.setItem(SITES_STORAGE_KEY, JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    window.localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    window.localStorage.setItem(REPRESENTATIVES_STORAGE_KEY, JSON.stringify(representatives));
  }, [representatives]);

  useEffect(() => {
    window.localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    window.localStorage.setItem(STAGES_STORAGE_KEY, JSON.stringify(stages));
  }, [stages]);

  const value = useMemo<ObjectsContextValue>(() => {
    const addSite: ObjectsContextValue['addSite'] = (customerId, input) => {
      const id = `s-${Date.now()}`;
      const site: Site = { id, customerId, ...input };
      setSites((prev) => [...prev, site]);
      return id;
    };

    const updateSite: ObjectsContextValue['updateSite'] = (siteId, patch) => {
      setSites((prev) => prev.map((site) => (site.id === siteId ? { ...site, ...patch } : site)));
    };

    const canDeleteSite: ObjectsContextValue['canDeleteSite'] = (siteId) => {
      const departmentCount = departments.filter((department) => department.siteId === siteId).length;
      if (departmentCount > 0) {
        return { allowed: false, reason: `Нельзя удалить: есть привязанные службы (${departmentCount})` };
      }
      const materialCount = materials.filter((material) => material.siteId === siteId).length;
      if (materialCount > 0) {
        return { allowed: false, reason: `Нельзя удалить: есть записи материалов (${materialCount})` };
      }
      const requestCount = requests.filter((request) => request.siteId === siteId).length;
      if (requestCount > 0) {
        return { allowed: false, reason: `Нельзя удалить: есть заявки (${requestCount})` };
      }
      return { allowed: true };
    };

    const deleteSite: ObjectsContextValue['deleteSite'] = (siteId) => {
      if (!canDeleteSite(siteId).allowed) return;
      setSites((prev) => prev.filter((site) => site.id !== siteId));
    };

    const getDepartmentsBySite: ObjectsContextValue['getDepartmentsBySite'] = (siteId) =>
      departments.filter((department) => department.siteId === siteId);

    const addDepartment: ObjectsContextValue['addDepartment'] = (siteId, name) => {
      const id = `d-${Date.now()}`;
      const department: Department = { id, siteId, name };
      setDepartments((prev) => [...prev, department]);
      return id;
    };

    const updateDepartment: ObjectsContextValue['updateDepartment'] = (departmentId, name) => {
      setDepartments((prev) =>
        prev.map((department) => (department.id === departmentId ? { ...department, name } : department)),
      );
    };

    const canDeleteDepartment: ObjectsContextValue['canDeleteDepartment'] = (departmentId) => {
      const representativeCount = representatives.filter(
        (representative) => representative.departmentId === departmentId,
      ).length;
      if (representativeCount > 0) {
        return { allowed: false, reason: `Нельзя удалить: есть привязанные представители (${representativeCount})` };
      }
      const requestCount = requests.filter((request) => request.departmentId === departmentId).length;
      if (requestCount > 0) {
        return { allowed: false, reason: `Нельзя удалить: есть заявки (${requestCount})` };
      }
      return { allowed: true };
    };

    const deleteDepartment: ObjectsContextValue['deleteDepartment'] = (departmentId) => {
      if (!canDeleteDepartment(departmentId).allowed) return;
      setDepartments((prev) => prev.filter((department) => department.id !== departmentId));
    };

    const getRepresentativesByDepartment: ObjectsContextValue['getRepresentativesByDepartment'] = (departmentId) =>
      representatives.filter((representative) => representative.departmentId === departmentId);

    const addRepresentative: ObjectsContextValue['addRepresentative'] = (departmentId, input) => {
      const id = `rep-${Date.now()}`;
      const representative: Representative = { id, departmentId, ...input };
      setRepresentatives((prev) => [...prev, representative]);
      return id;
    };

    const updateRepresentative: ObjectsContextValue['updateRepresentative'] = (representativeId, patch) => {
      setRepresentatives((prev) =>
        prev.map((representative) =>
          representative.id === representativeId ? { ...representative, ...patch } : representative,
        ),
      );
    };

    const canDeleteRepresentative: ObjectsContextValue['canDeleteRepresentative'] = (representativeId) => {
      const requestCount = requests.filter((request) => request.representativeId === representativeId).length;
      if (requestCount > 0) {
        return { allowed: false, reason: `Нельзя удалить: есть заявки (${requestCount})` };
      }
      return { allowed: true };
    };

    const deleteRepresentative: ObjectsContextValue['deleteRepresentative'] = (representativeId) => {
      if (!canDeleteRepresentative(representativeId).allowed) return;
      setRepresentatives((prev) => prev.filter((representative) => representative.id !== representativeId));
    };

    const getMaterialsBySite: ObjectsContextValue['getMaterialsBySite'] = (siteId) =>
      materials.filter((material) => material.siteId === siteId);

    const filesToMetas = (files: File[]): MaterialFileMeta[] =>
      files.map((file, index) => {
        const fileId = `matfile-${Date.now()}-${index}`;
        fileStoreRef.current.set(fileId, file);
        return { id: fileId, name: file.name, uploadedAt: new Date().toISOString() };
      });

    const addMaterial: ObjectsContextValue['addMaterial'] = (siteId, input, files) => {
      const material: MaterialRecord = {
        id: `mat-${Date.now()}`,
        siteId,
        name: input.name,
        description: input.description,
        createdAt: new Date().toISOString(),
        files: filesToMetas(files),
      };
      setMaterials((prev) => [material, ...prev]);
    };

    const updateMaterial: ObjectsContextValue['updateMaterial'] = (materialId, input) => {
      setMaterials((prev) =>
        prev.map((material) =>
          material.id === materialId ? { ...material, name: input.name, description: input.description } : material,
        ),
      );
    };

    const deleteMaterial: ObjectsContextValue['deleteMaterial'] = (materialId) => {
      setMaterials((prev) => {
        const target = prev.find((material) => material.id === materialId);
        if (target) {
          target.files.forEach((file) => fileStoreRef.current.delete(file.id));
        }
        return prev.filter((material) => material.id !== materialId);
      });
    };

    const addFilesToMaterial: ObjectsContextValue['addFilesToMaterial'] = (materialId, files) => {
      const fileMetas = filesToMetas(files);
      setMaterials((prev) =>
        prev.map((material) =>
          material.id === materialId ? { ...material, files: [...material.files, ...fileMetas] } : material,
        ),
      );
    };

    const removeMaterialFile: ObjectsContextValue['removeMaterialFile'] = (materialId, fileId) => {
      fileStoreRef.current.delete(fileId);
      setMaterials((prev) =>
        prev.map((material) =>
          material.id === materialId
            ? { ...material, files: material.files.filter((file) => file.id !== fileId) }
            : material,
        ),
      );
    };

    const getMaterialFile: ObjectsContextValue['getMaterialFile'] = (fileId) => fileStoreRef.current.get(fileId);

    const getStagesBySite: ObjectsContextValue['getStagesBySite'] = (siteId) =>
      stages.filter((stage) => stage.siteId === siteId);

    const addStage: ObjectsContextValue['addStage'] = (siteId, input) => {
      const stage: Stage = {
        id: `stage-${Date.now()}`,
        siteId,
        name: input.name,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        status: input.status,
        assignee: input.assignee,
        progress: input.progress,
        dependsOn: input.dependsOn,
        files: [],
        requestIds: input.requestIds,
      };
      setStages((prev) => [...prev, stage]);
    };

    const updateStage: ObjectsContextValue['updateStage'] = (stageId, input) => {
      setStages((prev) =>
        prev.map((stage) => (stage.id === stageId ? { ...stage, ...input } : stage)),
      );
    };

    const updateStageLimited: ObjectsContextValue['updateStageLimited'] = (stageId, input) => {
      setStages((prev) =>
        prev.map((stage) => (stage.id === stageId ? { ...stage, ...input } : stage)),
      );
    };

    const updateStageProgress: ObjectsContextValue['updateStageProgress'] = (stageId, progress) => {
      const clamped = Math.min(100, Math.max(0, Math.round(progress)));
      setStages((prev) =>
        prev.map((stage) => (stage.id === stageId ? { ...stage, progress: clamped } : stage)),
      );
    };

    const canDeleteStage: ObjectsContextValue['canDeleteStage'] = (stageId) => {
      const stage = stages.find((item) => item.id === stageId);
      if (!stage) return { allowed: true };
      if (stage.requestIds.length > 0) {
        return { allowed: false, reason: `Нельзя удалить: есть привязанные заявки (${stage.requestIds.length})` };
      }
      if (stage.files.length > 0) {
        return { allowed: false, reason: `Нельзя удалить: есть прикреплённые файлы (${stage.files.length})` };
      }
      const dependentCount = stages.filter((item) => item.dependsOn === stageId).length;
      if (dependentCount > 0) {
        return { allowed: false, reason: `Нельзя удалить: от этапа зависят другие этапы (${dependentCount})` };
      }
      return { allowed: true };
    };

    const deleteStage: ObjectsContextValue['deleteStage'] = (stageId) => {
      if (!canDeleteStage(stageId).allowed) return;
      setStages((prev) => prev.filter((stage) => stage.id !== stageId));
    };

    const addFilesToStage: ObjectsContextValue['addFilesToStage'] = (stageId, files) => {
      const fileMetas = filesToMetas(files);
      setStages((prev) =>
        prev.map((stage) => (stage.id === stageId ? { ...stage, files: [...stage.files, ...fileMetas] } : stage)),
      );
    };

    const removeStageFile: ObjectsContextValue['removeStageFile'] = (stageId, fileId) => {
      fileStoreRef.current.delete(fileId);
      setStages((prev) =>
        prev.map((stage) =>
          stage.id === stageId ? { ...stage, files: stage.files.filter((file) => file.id !== fileId) } : stage,
        ),
      );
    };

    const getStageFile: ObjectsContextValue['getStageFile'] = (fileId) => fileStoreRef.current.get(fileId);

    return {
      sites,
      addSite,
      updateSite,
      canDeleteSite,
      deleteSite,
      departments,
      getDepartmentsBySite,
      addDepartment,
      updateDepartment,
      canDeleteDepartment,
      deleteDepartment,
      representatives,
      getRepresentativesByDepartment,
      addRepresentative,
      updateRepresentative,
      canDeleteRepresentative,
      deleteRepresentative,
      materials,
      getMaterialsBySite,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      addFilesToMaterial,
      removeMaterialFile,
      getMaterialFile,
      stages,
      getStagesBySite,
      addStage,
      updateStage,
      updateStageLimited,
      updateStageProgress,
      canDeleteStage,
      deleteStage,
      addFilesToStage,
      removeStageFile,
      getStageFile,
    };
  }, [sites, departments, representatives, materials, stages, requests]);

  return <ObjectsContext.Provider value={value}>{children}</ObjectsContext.Provider>;
}
