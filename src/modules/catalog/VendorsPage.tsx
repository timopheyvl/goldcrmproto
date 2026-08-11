import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useRole } from '../../context/useRole';
import { Modal } from '../../components/Modal';
import { useVendors } from './useVendors';
import type { UploadFormat, Vendor } from './types';
import './catalog.css';

const UPLOAD_FORMATS: UploadFormat[] = ['XLSX', 'CSV', 'XML'];

interface VendorFormState {
  name: string;
  uploadFormat: UploadFormat;
}

const EMPTY_FORM: VendorFormState = { name: '', uploadFormat: 'XLSX' };

export function VendorsPage() {
  const { role } = useRole();
  const { vendors, addVendor, updateVendor } = useVendors();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VendorFormState>(EMPTY_FORM);

  if (role !== 'manager') {
    return <Navigate to="/catalog" replace />;
  }

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (vendor: Vendor) => {
    setEditingId(vendor.id);
    setForm({ name: vendor.name, uploadFormat: vendor.uploadFormat });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateVendor(editingId, form);
    } else {
      addVendor(form);
    }
    setModalOpen(false);
  };

  return (
    <div className="vendors-page">
      <div className="import-page__breadcrumb">
        <Link to="/catalog">Каталог</Link> / Вендоры
      </div>
      <div className="vendors-page__header">
        <h1 className="import-page__title">Вендоры</h1>
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          Добавить вендора
        </button>
      </div>

      <table className="import-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Формат выгрузки</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor.id}>
              <td>{vendor.name}</td>
              <td>
                <span className="status-badge status-badge--neutral">{vendor.uploadFormat}</span>
              </td>
              <td>
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => openEdit(vendor)}>
                  Редактировать
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Редактировать вендора' : 'Новый вендор'} width={420}>
        <div className="import-form">
          <label className="import-form__field">
            <span>Название</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="ООО «Название»"
            />
          </label>
          <label className="import-form__field">
            <span>Формат выгрузки</span>
            <select
              value={form.uploadFormat}
              onChange={(event) => setForm((prev) => ({ ...prev, uploadFormat: event.target.value as UploadFormat }))}
            >
              {UPLOAD_FORMATS.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn--primary" disabled={!form.name.trim()} onClick={handleSave}>
            {editingId ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
