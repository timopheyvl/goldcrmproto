import { useObjects } from './useObjects';
import './objects.css';

/**
 * Только просмотр списка служб объекта — создание/редактирование/удаление
 * служб доступно исключительно в модуле «Управление» (см. CLAUDE.md,
 * раздел «Объекты»: «Службы в карточке объекта — только показ»).
 */
export function DepartmentsTab({ siteId }: { siteId: string }) {
  const { getDepartmentsBySite } = useObjects();
  const departments = getDepartmentsBySite(siteId);

  return (
    <div className="departments-tab">
      {departments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">Служб пока нет</div>
          <p>Службы появятся здесь после того как менеджер добавит их в модуле «Управление».</p>
        </div>
      ) : (
        <table className="import-table">
          <thead>
            <tr>
              <th>Название</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((department) => (
              <tr key={department.id}>
                <td>{department.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
