import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, X, MapPin } from 'lucide-react';
import { locationApi, warehouseApi } from '../services/api';
import type { Location, LocationRequest, Warehouse } from '../types';
import { useToast } from './ToastProvider';

export function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await locationApi.getAll();
      setLocations(data);
    } catch (err: any) {
      showToast('error', 'Failed to load locations', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Locations</h1>
          <p>Organize inventory storage areas.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Add Location
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : locations.length === 0 ? (
          <div className="empty-state">
            <MapPin size={48} className="text-[var(--color-text-muted)] mb-4" />
            <h3>No Locations Yet</h3>
            <p>Create locations inside your warehouses to track stock.</p>
            <button className="btn btn-primary mt-6" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Add Location
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Warehouse</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map(loc => (
                  <tr key={loc.id}>
                    <td className="font-medium">{loc.code}</td>
                    <td>{loc.name}</td>
                    <td>{loc.warehouseName}</td>
                    <td>
                      <span className={`badge badge-${loc.status.toLowerCase()}`}>
                        {loc.status}
                      </span>
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
        <LocationFormModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchLocations();
          }}
        />
      )}
    </div>
  );
}

function LocationFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [formData, setFormData] = useState<LocationRequest>({
    name: '', code: '', warehouseId: 0, status: 'ACTIVE'
  });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    warehouseApi.getAll().then(setWarehouses).catch(() => {
      showToast('error', 'Failed to load warehouses');
    });
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warehouseId) {
      showToast('error', 'Validation Error', 'Please select a warehouse');
      return;
    }
    try {
      setSubmitting(true);
      await locationApi.create(formData);
      showToast('success', 'Location created successfully.');
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
          <h2 className="text-lg font-semibold">New Location</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Warehouse</label>
            <select
              required
              className="select-field"
              value={formData.warehouseId || ''}
              onChange={e => setFormData({ ...formData, warehouseId: Number(e.target.value) })}
            >
              <option value="" disabled>Select a warehouse...</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Location Name</label>
            <input
              required
              className="input-field"
              placeholder="e.g. Rack A"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div>
            <label className="label">Location Code</label>
            <input
              required
              className="input-field uppercase"
              placeholder="e.g. RACK-A"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
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
