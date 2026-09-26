import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Check, X } from 'lucide-react';
import { warehouseApi } from '../services/api';
import type { Warehouse, WarehouseRequest } from '../types';
import { useToast } from './ToastProvider';

export function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const data = await warehouseApi.getAll();
      setWarehouses(data);
    } catch (err: any) {
      showToast('error', 'Failed to load warehouses', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Warehouses</h1>
          <p>Manage storage facilities and their locations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Add Warehouse
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : warehouses.length === 0 ? (
          <div className="empty-state">
            <Box size={48} className="text-[var(--color-text-muted)] mb-4" />
            <h3>No Warehouses Yet</h3>
            <p>Create your first warehouse to start organizing inventory.</p>
            <button className="btn btn-primary mt-6" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Add Warehouse
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Locations</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map(w => (
                  <tr key={w.id}>
                    <td className="font-medium">{w.code}</td>
                    <td>{w.name}</td>
                    <td>{w.locationCount}</td>
                    <td>
                      <span className={`badge badge-${w.status.toLowerCase()}`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="text-[var(--color-text-secondary)]">
                      {new Date(w.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <button className="btn-ghost p-1 rounded hover:bg-[var(--color-surface-hover)]">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <WarehouseFormModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchWarehouses();
          }}
        />
      )}
    </div>
  );
}

function WarehouseFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState<WarehouseRequest>({
    name: '', code: '', address: '', status: 'ACTIVE'
  });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await warehouseApi.create(formData);
      showToast('success', 'Warehouse created successfully.');
      onSuccess();
    } catch (err: any) {
      showToast('error', 'Creation failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">New Warehouse</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Warehouse Name</label>
            <input
              required
              className="input-field"
              placeholder="e.g. Main Warehouse"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div>
            <label className="label">Warehouse Code</label>
            <input
              required
              className="input-field uppercase"
              placeholder="e.g. MAIN-WH"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>

          <div>
            <label className="label">Address</label>
            <input
              className="input-field"
              placeholder="Optional address"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className="select-field"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add the missing Box import at the top for the empty state
import { Box } from 'lucide-react';
