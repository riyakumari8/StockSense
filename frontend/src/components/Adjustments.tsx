import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, SlidersHorizontal, X, Check } from 'lucide-react';
import { adjustmentApi, warehouseApi, locationApi, productApi, stockApi } from '../services/api';
import type { StockAdjustment, AdjustmentRequest, Warehouse, Location, Product } from '../types';
import { useToast } from './ToastProvider';

export function Adjustments() {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const data = await adjustmentApi.getAll();
      setAdjustments(data.content);
    } catch (err: any) {
      showToast('error', 'Failed to load adjustments', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const validateAdjustment = async (id: number) => {
    try {
      await adjustmentApi.validate(id);
      showToast('success', 'Adjustment approved successfully.');
      fetchAdjustments();
    } catch (err: any) {
      showToast('error', 'Validation failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Stock Adjustments</h1>
          <p>Reconcile physical counts with system records.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          New Adjustment
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : adjustments.length === 0 ? (
          <div className="empty-state">
            <SlidersHorizontal size={48} className="text-[var(--color-text-muted)] mb-4" />
            <h3>No Adjustments Found</h3>
            <p>Record stock discrepancies after physical counts.</p>
            <button className="btn btn-primary mt-6" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> New Adjustment
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Product</th>
                  <th>Location</th>
                  <th className="text-right">System Qty</th>
                  <th className="text-right">Physical Qty</th>
                  <th className="text-right">Diff</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map(adj => (
                  <tr key={adj.id}>
                    <td className="font-medium">{adj.referenceNumber}</td>
                    <td>
                      <div>{adj.productName}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{adj.productSku}</div>
                    </td>
                    <td>
                      <div>{adj.warehouseName}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{adj.locationName}</div>
                    </td>
                    <td className="text-right text-[var(--color-text-secondary)]">{adj.systemQuantity}</td>
                    <td className="text-right font-medium">{adj.physicalQuantity}</td>
                    <td className={`text-right font-medium ${
                      adj.difference > 0 ? 'text-[var(--color-success)]' : 
                      adj.difference < 0 ? 'text-[var(--color-danger)]' : 
                      'text-[var(--color-text-muted)]'
                    }`}>
                      {adj.difference > 0 ? '+' : ''}{adj.difference}
                    </td>
                    <td>
                      <span className={`badge badge-${adj.status.toLowerCase()}`}>
                        {adj.status}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate" title={adj.reason}>{adj.reason}</td>
                    <td className="text-right">
                      {adj.status === 'DRAFT' && (
                        <button 
                          className="btn btn-sm btn-ghost text-[var(--color-success)] hover:bg-[var(--color-success-subtle)] mr-2"
                          onClick={() => validateAdjustment(adj.id)}
                          title="Approve Adjustment"
                        >
                          <Check size={16} /> Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <AdjustmentFormModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchAdjustments();
          }}
        />
      )}
    </div>
  );
}

function AdjustmentFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [systemQuantity, setSystemQuantity] = useState<number | null>(null);

  const [formData, setFormData] = useState<Partial<AdjustmentRequest>>({
    physicalQuantity: 0,
    reason: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    warehouseApi.getAll().then(setWarehouses);
    productApi.getAll().then(setProducts);
  }, []);

  useEffect(() => {
    if (formData.warehouseId) {
      locationApi.getAll(formData.warehouseId).then(setLocations);
      setFormData(prev => ({ ...prev, locationId: undefined }));
    }
  }, [formData.warehouseId]);

  useEffect(() => {
    if (formData.productId && formData.locationId) {
      stockApi.getQuantity(formData.productId, formData.locationId)
        .then(setSystemQuantity)
        .catch(() => setSystemQuantity(0));
    } else {
      setSystemQuantity(null);
    }
  }, [formData.productId, formData.locationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.warehouseId || !formData.locationId || 
        formData.physicalQuantity === undefined || !formData.reason) {
      showToast('error', 'Validation Error', 'Please fill all fields');
      return;
    }

    try {
      setSubmitting(true);
      await adjustmentApi.create(formData as AdjustmentRequest);
      showToast('success', 'Adjustment recorded as Draft.');
      onSuccess();
    } catch (err: any) {
      showToast('error', 'Creation failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const diff = systemQuantity !== null && formData.physicalQuantity !== undefined 
    ? formData.physicalQuantity - systemQuantity 
    : 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Record Physical Count</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Warehouse</label>
              <select
                required
                className="select-field"
                value={formData.warehouseId || ''}
                onChange={e => setFormData({ ...formData, warehouseId: Number(e.target.value) })}
              >
                <option value="" disabled>Select...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Location</label>
              <select
                required
                className="select-field"
                value={formData.locationId || ''}
                onChange={e => setFormData({ ...formData, locationId: Number(e.target.value) })}
                disabled={!formData.warehouseId}
              >
                <option value="" disabled>Select...</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Product</label>
            <select
              required
              className="select-field"
              value={formData.productId || ''}
              onChange={e => setFormData({ ...formData, productId: Number(e.target.value) })}
            >
              <option value="" disabled>Select product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>

          <div className="p-4 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border-subtle)] space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">System Quantity:</span>
              <span className="text-lg font-semibold font-mono">
                {systemQuantity !== null ? systemQuantity : '-'}
              </span>
            </div>

            <div>
              <label className="label">Actual Physical Quantity Found</label>
              <input
                type="number"
                required
                min="0"
                className="input-field font-mono text-lg"
                value={formData.physicalQuantity}
                onChange={e => setFormData({ ...formData, physicalQuantity: Number(e.target.value) })}
              />
            </div>

            {systemQuantity !== null && diff !== 0 && (
              <div className={`text-sm font-medium p-2 rounded ${
                diff > 0 ? 'bg-[var(--color-success-subtle)] text-[var(--color-success)]' : 
                'bg-[var(--color-danger-subtle)] text-[var(--color-danger)]'
              }`}>
                Reconciliation Difference: {diff > 0 ? '+' : ''}{diff} units
              </div>
            )}
          </div>

          <div>
            <label className="label">Reason / Notes</label>
            <input
              required
              className="input-field"
              placeholder="e.g. Damaged during sorting, Found extra stock"
              value={formData.reason || ''}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
