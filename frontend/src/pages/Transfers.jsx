import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import transferService from '../services/transferService';
import locationService from '../services/locationService';
import productService from '../services/productService';
import {
  ArrowRightLeft,
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

export default function Transfers() {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create Transfer Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    sourceLocationId: '',
    destinationLocationId: '',
    reference: '',
    notes: '',
    items: []
  });

  const [newItem, setNewItem] = useState({ productId: '', quantity: 1 });
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [trfData, locData, prodData] = await Promise.all([
        transferService.getAll(),
        locationService.getAll(),
        productService.getAll()
      ]);
      setTransfers(trfData);
      setLocations(locData);
      setProducts(prodData);
    } catch (err) {
      setError(err.message || 'Failed to load stock transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      sourceLocationId: locations.length > 0 ? locations[0].id.toString() : '',
      destinationLocationId: locations.length > 1 ? locations[1].id.toString() : '',
      reference: '',
      notes: '',
      items: []
    });
    setNewItem({ productId: products.length > 0 ? products[0].id.toString() : '', quantity: 1 });
    setModalError('');
    setModalOpen(true);
  };

  const handleAddItem = () => {
    if (!newItem.productId) return;
    const qty = parseInt(newItem.quantity, 10) || 1;
    if (qty <= 0) return;

    const prod = products.find((p) => p.id === parseInt(newItem.productId, 10));
    if (!prod) return;

    // Check if already added
    if (formData.items.some((i) => i.productId === prod.id)) {
      setModalError(`Product "${prod.name}" is already added to transfer items.`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { productId: prod.id, productName: prod.name, sku: prod.sku, quantity: qty }]
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

    if (formData.sourceLocationId === formData.destinationLocationId) {
      setModalError('Source and Destination locations cannot be the same');
      return;
    }

    if (formData.items.length === 0) {
      setModalError('Please add at least one product to transfer');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      sourceLocationId: parseInt(formData.sourceLocationId, 10),
      destinationLocationId: parseInt(formData.destinationLocationId, 10),
      reference: formData.reference,
      notes: formData.notes,
      items: formData.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
    };

    try {
      await transferService.create(payload);
      setSuccessMsg('Transfer created in DRAFT status! Stock has not changed yet.');
      setModalOpen(false);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setModalError(err.message || 'Failed to create transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidate = async (id, num) => {
    if (!window.confirm(`Validate transfer "${num}"? This will move stock between locations.`)) return;
    try {
      await transferService.validate(id);
      setSuccessMsg(`Transfer "${num}" validated! Stock updated successfully.`);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Transfer validation failed');
    }
  };

  const handleCancel = async (id, num) => {
    if (!window.confirm(`Cancel draft transfer "${num}"?`)) return;
    try {
      await transferService.cancel(id);
      setSuccessMsg(`Transfer "${num}" cancelled.`);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to cancel transfer');
    }
  };

  return (
    <Layout pageTitle="Internal Stock Transfers">
      <div className="space-y-6">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
              <span>Internal Stock Transfers</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Move inventory products between warehouses and rack locations safely with transactional validation.
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Transfer</span>
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

        {/* Transfers Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <span>Loading stock transfers...</span>
            </div>
          ) : transfers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No stock transfers created yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3.5 px-6">Transfer Number</th>
                    <th className="py-3.5 px-6">Source Location</th>
                    <th className="py-3.5 px-6">Destination Location</th>
                    <th className="py-3.5 px-6">Items Count</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {transfers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-600">
                        <Link to={`/transfers/${t.id}`} className="hover:underline">
                          {t.transferNumber}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-slate-800">
                        {t.sourceLocation?.name} <span className="font-mono text-slate-400">({t.sourceLocation?.code})</span>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-slate-800">
                        {t.destinationLocation?.name} <span className="font-mono text-slate-400">({t.destinationLocation?.code})</span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {t.items ? t.items.length : 0} product(s)
                      </td>
                      <td className="py-4 px-6">
                        {t.status === 'VALIDATED' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> VALIDATED
                          </span>
                        ) : t.status === 'CANCELLED' ? (
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
                          to={`/transfers/${t.id}`}
                          className="p-1.5 inline-block rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          title="View Transfer Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {t.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => handleValidate(t.id, t.transferNumber)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs"
                            >
                              Validate
                            </button>
                            <button
                              onClick={() => handleCancel(t.id, t.transferNumber)}
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

      {/* CREATE TRANSFER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Create Internal Stock Transfer</h3>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Source Location *</label>
                  <select
                    value={formData.sourceLocationId}
                    onChange={(e) => setFormData({ ...formData, sourceLocationId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.warehouse?.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Destination Location *</label>
                  <select
                    value={formData.destinationLocationId}
                    onChange={(e) => setFormData({ ...formData, destinationLocationId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.warehouse?.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add Items Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">Add Products to Transfer</p>
                <div className="flex items-center space-x-2">
                  <select
                    value={newItem.productId}
                    onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
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
                          <span className="font-semibold text-slate-900">{item.productName}</span>
                          <span className="font-mono text-slate-400 ml-1">({item.sku})</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-indigo-600">{item.quantity} units</span>
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

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Reference / Note</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="e.g. PO-8839 / Internal Transfer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3.5 py-2 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md">
                  {isSubmitting ? 'Creating...' : 'Create Draft Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
