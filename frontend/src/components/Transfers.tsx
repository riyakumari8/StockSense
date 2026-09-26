import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, ArrowRightLeft, X, ArrowRight, Check } from 'lucide-react';
import { transferApi, warehouseApi, locationApi, productApi, stockApi } from '../services/api';
import type { Transfer, TransferRequest, Warehouse, Location, Product } from '../types';
import { useToast } from './ToastProvider';

export function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const data = await transferApi.getAll();
      setTransfers(data.content);
    } catch (err: any) {
      showToast('error', 'Failed to load transfers', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const validateTransfer = async (id: number) => {
    try {
      await transferApi.validate(id);
      showToast('success', 'Transfer completed successfully.');
      fetchTransfers();
    } catch (err: any) {
      showToast('error', 'Validation failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Internal Transfers</h1>
          <p>Move inventory between warehouse locations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          New Transfer
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : transfers.length === 0 ? (
          <div className="empty-state">
            <ArrowRightLeft size={48} className="text-[var(--color-text-muted)] mb-4" />
            <h3>No Transfers Found</h3>
            <p>Create a transfer to move stock between locations.</p>
            <button className="btn btn-primary mt-6" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> New Transfer
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Product</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map(tr => (
                  <tr key={tr.id}>
                    <td className="font-medium text-[var(--color-accent)]">{tr.referenceNumber}</td>
                    <td>
                      <div>{tr.productName}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{tr.productSku}</div>
                    </td>
                    <td>
                      <div>{tr.sourceWarehouseName}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{tr.sourceLocationName}</div>
                    </td>
                    <td>
                      <div>{tr.destinationWarehouseName}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{tr.destinationLocationName}</div>
                    </td>
                    <td className="font-medium">{tr.quantity}</td>
                    <td>
                      <span className={`badge badge-${tr.status.toLowerCase()}`}>
                        {tr.status}
                      </span>
                    </td>
                    <td className="text-[var(--color-text-secondary)] text-sm">
                      {new Date(tr.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      {tr.status === 'DRAFT' && (
                        <button 
                          className="btn btn-sm btn-ghost text-[var(--color-success)] hover:bg-[var(--color-success-subtle)] mr-2"
                          onClick={() => validateTransfer(tr.id)}
                          title="Validate Transfer"
                        >
                          <Check size={16} /> Validate
                        </button>
                      )}
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
        <TransferFormModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchTransfers();
          }}
        />
      )}
    </div>
  );
}

function TransferFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [sourceLocations, setSourceLocations] = useState<Location[]>([]);
  const [destLocations, setDestLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [availableStock, setAvailableStock] = useState<number | null>(null);

  const [formData, setFormData] = useState<Partial<TransferRequest>>({
    quantity: 1
  });
  
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    warehouseApi.getAll().then(setWarehouses);
    productApi.getAll().then(setProducts);
  }, []);

  // Fetch source locations when source warehouse changes
  useEffect(() => {
    if (formData.sourceWarehouseId) {
      locationApi.getAll(formData.sourceWarehouseId).then(setSourceLocations);
      setFormData(prev => ({ ...prev, sourceLocationId: undefined }));
    }
  }, [formData.sourceWarehouseId]);

  // Fetch dest locations when dest warehouse changes
  useEffect(() => {
    if (formData.destinationWarehouseId) {
      locationApi.getAll(formData.destinationWarehouseId).then(setDestLocations);
      setFormData(prev => ({ ...prev, destinationLocationId: undefined }));
    }
  }, [formData.destinationWarehouseId]);

  // Fetch available stock when product or source location changes
  useEffect(() => {
    if (formData.productId && formData.sourceLocationId) {
      stockApi.getQuantity(formData.productId, formData.sourceLocationId)
        .then(setAvailableStock)
        .catch(() => setAvailableStock(0));
    } else {
      setAvailableStock(null);
    }
  }, [formData.productId, formData.sourceLocationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.sourceWarehouseId || !formData.sourceLocationId ||
        !formData.destinationWarehouseId || !formData.destinationLocationId || !formData.quantity) {
      showToast('error', 'Validation Error', 'Please fill all required fields');
      return;
    }

    if (formData.sourceLocationId === formData.destinationLocationId) {
      showToast('error', 'Validation Error', 'Source and destination locations cannot be the same');
      return;
    }

    if (availableStock !== null && formData.quantity > availableStock) {
      showToast('error', 'Insufficient Stock', `Only ${availableStock} units available at source location.`);
      return;
    }

    try {
      setSubmitting(true);
      await transferApi.create(formData as TransferRequest);
      showToast('success', 'Transfer created successfully.');
      onSuccess();
    } catch (err: any) {
      showToast('error', 'Creation failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">New Internal Transfer</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* FROM SECTION */}
            <div className="space-y-4 p-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-base)]">
              <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase">From</h3>
              
              <div>
                <label className="label">Source Warehouse</label>
                <select
                  required
                  className="select-field"
                  value={formData.sourceWarehouseId || ''}
                  onChange={e => setFormData({ ...formData, sourceWarehouseId: Number(e.target.value) })}
                >
                  <option value="" disabled>Select...</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Source Location</label>
                <select
                  required
                  className="select-field"
                  value={formData.sourceLocationId || ''}
                  onChange={e => setFormData({ ...formData, sourceLocationId: Number(e.target.value) })}
                  disabled={!formData.sourceWarehouseId}
                >
                  <option value="" disabled>Select...</option>
                  {sourceLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            {/* TO SECTION */}
            <div className="space-y-4 p-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-base)]">
              <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase">To</h3>
              
              <div>
                <label className="label">Destination Warehouse</label>
                <select
                  required
                  className="select-field"
                  value={formData.destinationWarehouseId || ''}
                  onChange={e => setFormData({ ...formData, destinationWarehouseId: Number(e.target.value) })}
                >
                  <option value="" disabled>Select...</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Destination Location</label>
                <select
                  required
                  className="select-field"
                  value={formData.destinationLocationId || ''}
                  onChange={e => setFormData({ ...formData, destinationLocationId: Number(e.target.value) })}
                  disabled={!formData.destinationWarehouseId}
                >
                  <option value="" disabled>Select...</option>
                  {destLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center -mt-10 mb-4 pointer-events-none">
             <div className="w-8 h-8 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-muted)] z-10">
                <ArrowRight size={16} />
             </div>
          </div>

          {/* ITEM DETAILS */}
          <div className="space-y-4">
            <div>
              <label className="label">Product</label>
              <select
                required
                className="select-field"
                value={formData.productId || ''}
                onChange={e => setFormData({ ...formData, productId: Number(e.target.value) })}
              >
                <option value="" disabled>Select product to transfer...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="label">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="input-field"
                  value={formData.quantity || ''}
                  onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="flex-1">
                <label className="label">Available Stock (Source)</label>
                <div className="input-field bg-transparent border-dashed text-[var(--color-text-secondary)]">
                  {availableStock !== null ? `${availableStock} units` : 'Select product & source'}
                </div>
              </div>
            </div>
          </div>

          {/* LIVE SUMMARY / WARNING */}
          {availableStock !== null && formData.quantity && formData.quantity > availableStock && (
             <div className="p-3 rounded bg-[var(--color-danger-subtle)] text-[var(--color-danger)] text-sm font-medium">
                ⚠ Insufficient stock. Only {availableStock} units are available.
             </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
