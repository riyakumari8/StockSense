import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import adjustmentService from '../services/adjustmentService';
import locationService from '../services/locationService';
import productService from '../services/productService';
import {
  Sliders,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Eye,
  X,
  PlusCircle,
  Trash2
} from 'lucide-react';

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    locationId: '',
    reason: '',
    notes: '',
    items: []
  });

  const [newItem, setNewItem] = useState({ productId: '', physicalQuantity: 0 });
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [adjData, locData, prodData] = await Promise.all([
        adjustmentService.getAll(),
        locationService.getAll(),
        productService.getAll()
      ]);
      setAdjustments(adjData);
      setLocations(locData);
      setProducts(prodData);
    } catch (err) {
      setError(err.message || 'Failed to load stock adjustments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      locationId: locations.length > 0 ? locations[0].id.toString() : '',
      reason: 'Physical Inventory Audit',
      notes: '',
      items: []
    });
    setNewItem({
      productId: products.length > 0 ? products[0].id.toString() : '',
      physicalQuantity: products.length > 0 ? products[0].quantityOnHand : 0
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleAddItem = () => {
    if (!newItem.productId) return;
    const physQty = parseInt(newItem.physicalQuantity, 10);
    if (isNaN(physQty) || physQty < 0) return;

    const prod = products.find((p) => p.id === parseInt(newItem.productId, 10));
    if (!prod) return;

    if (formData.items.some((i) => i.productId === prod.id)) {
      setModalError(`Product "${prod.name}" is already in adjustment items.`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          systemQuantity: prod.quantityOnHand,
          physicalQuantity: physQty,
          difference: physQty - prod.quantityOnHand
        }
      ]
    }));
    setModalError('');
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (formData.items.length === 0) {
      setModalError('Please add at least one product to adjust');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      locationId: parseInt(formData.locationId, 10),
      reason: formData.reason,
      notes: formData.notes,
      items: formData.items.map((i) => ({ productId: i.productId, physicalQuantity: i.physicalQuantity }))
    };

    try {
      await adjustmentService.create(payload);
      setSuccessMsg('Adjustment created in DRAFT status! Stock has not been modified yet.');
      setModalOpen(false);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setModalError(err.message || 'Failed to create adjustment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidate = async (id, num) => {
    if (!window.confirm(`Validate stock adjustment "${num}"? This will update physical stock levels.`)) return;
    try {
      await adjustmentService.validate(id);
      setSuccessMsg(`Stock adjustment "${num}" validated! Inventory reconciled.`);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Adjustment validation failed');
    }
  };

  const handleCancel = async (id, num) => {
    if (!window.confirm(`Cancel draft adjustment "${num}"?`)) return;
    try {
      await adjustmentService.cancel(id);
      setSuccessMsg(`Adjustment "${num}" cancelled.`);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to cancel adjustment');
    }
  };

  return (
    <Layout pageTitle="Stock Adjustments">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>Stock Inventory Reconciliation</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Reconcile physical stock counts with system quantities and log variance differences to the ledger.
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Stock Adjustment</span>
          </button>
        </div>

        {/* Status Messages */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Adjustments Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <span>Loading stock adjustments...</span>
            </div>
          ) : adjustments.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No stock adjustments logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3.5 px-6">Adjustment Number</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Reason</th>
                    <th className="py-3.5 px-6">Items Count</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {adjustments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/60">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-600">
                        <Link to={`/adjustments/${a.id}`} className="hover:underline">
                          {a.adjustmentNumber}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-slate-800">
                        {a.location?.name} <span className="font-mono text-slate-400">({a.location?.warehouse?.code})</span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {a.reason || 'Annual Inventory Count'}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {a.items ? a.items.length : 0} product(s)
                      </td>
                      <td className="py-4 px-6">
                        {a.status === 'VALIDATED' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> VALIDATED
                          </span>
                        ) : a.status === 'CANCELLED' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                            <XCircle className="w-3.5 h-3.5 mr-1" /> CANCELLED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3.5 h-3.5 mr-1" /> DRAFT
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          to={`/adjustments/${a.id}`}
                          className="p-1.5 inline-block rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          title="View Adjustment Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {a.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => handleValidate(a.id, a.adjustmentNumber)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs"
                            >
                              Validate
                            </button>
                            <button
                              onClick={() => handleCancel(a.id, a.adjustmentNumber)}
                              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CREATE ADJUSTMENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">New Inventory Stock Adjustment</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Target Location *</label>
                <select
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name} ({l.warehouse?.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Reason / Reference</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g. Annual Audit / Damaged Goods Check"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Add Items Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">Add Product Physical Count</p>
                <div className="flex items-center space-x-2">
                  <select
                    value={newItem.productId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      const prod = products.find((p) => p.id === parseInt(pid, 10));
                      setNewItem({
                        productId: pid,
                        physicalQuantity: prod ? prod.quantityOnHand : 0
                      });
                    }}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (Sys Stock: {p.quantityOnHand})</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="0"
                    value={newItem.physicalQuantity}
                    onChange={(e) => setNewItem({ ...newItem, physicalQuantity: e.target.value })}
                    className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  />

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Added Items List */}
                {formData.items.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                        <div>
                          <p className="font-semibold text-slate-900">{item.productName}</p>
                          <p className="text-[11px] text-slate-500">System Stock: {item.systemQuantity} | Physical Count: {item.physicalQuantity}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`font-bold ${item.difference < 0 ? 'text-red-600' : item.difference > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {item.difference > 0 ? `+${item.difference}` : item.difference}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3.5 py-2 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md">
                  {isSubmitting ? 'Creating...' : 'Create Draft Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
