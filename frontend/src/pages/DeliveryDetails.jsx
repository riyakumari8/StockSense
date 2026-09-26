import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import deliveryService from '../services/deliveryService';
import {
  Truck,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Building2,
  MapPin,
  User,
  Calendar,
  Box,
  PackageCheck,
  Send,
  ChevronRight
} from 'lucide-react';

export default function DeliveryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchDeliveryDetails();
  }, [id]);

  const fetchDeliveryDetails = async () => {
    setLoading(true);
    try {
      const data = await deliveryService.getById(id);
      setDelivery(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch delivery details');
    } finally {
      setLoading(false);
    }
  };

  const handlePick = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const updated = await deliveryService.pick(id);
      setDelivery(updated);
      setSuccessMsg(`Delivery "${delivery.deliveryNumber}" picked successfully! Status set to PICKED.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Pick operation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePack = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const updated = await deliveryService.pack(id);
      setDelivery(updated);
      setSuccessMsg(`Delivery "${delivery.deliveryNumber}" packed successfully! Status set to PACKED.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Pack operation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidate = async () => {
    if (!window.confirm(`Validate delivery "${delivery.deliveryNumber}"? Stock quantities will be immediately deducted from the source location.`)) return;

    setIsProcessing(true);
    setError('');
    try {
      const updated = await deliveryService.validate(id);
      setDelivery(updated);
      setSuccessMsg(`Delivery "${delivery.deliveryNumber}" validated! Product inventory deducted successfully.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to validate delivery');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(`Cancel delivery "${delivery.deliveryNumber}"?`)) return;

    setIsProcessing(true);
    setError('');
    try {
      const updated = await deliveryService.cancel(id);
      setDelivery(updated);
      setSuccessMsg(`Delivery "${delivery.deliveryNumber}" cancelled.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to cancel delivery');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Delivery Details">
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-500 flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <span>Loading delivery order details...</span>
        </div>
      </Layout>
    );
  }

  if (error || !delivery) {
    return (
      <Layout pageTitle="Delivery Details">
        <div className="space-y-4">
          <Link to="/deliveries" className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-600 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Delivery Orders</span>
          </Link>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error || 'Delivery order not found.'}</span>
          </div>
        </div>
      </Layout>
    );
  }

  const steps = [
    { key: 'DRAFT', label: '1. Draft Created' },
    { key: 'PICKED', label: '2. Picked' },
    { key: 'PACKED', label: '3. Packed' },
    { key: 'VALIDATED', label: '4. Validated' }
  ];

  const getStepStatus = (stepKey) => {
    if (delivery.status === 'CANCELLED') return 'cancelled';
    const order = ['DRAFT', 'PICKED', 'PACKED', 'VALIDATED'];
    const currentIndex = order.indexOf(delivery.status);
    const stepIndex = order.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <Layout pageTitle={`Delivery ${delivery.deliveryNumber}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-3">
            <Link
              to="/deliveries"
              className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-mono font-bold text-indigo-600">{delivery.deliveryNumber}</h2>
                <span className="text-xs font-semibold text-slate-400">({delivery.customerName})</span>
              </div>
              {delivery.customerReference && (
                <p className="text-xs text-slate-500 mt-0.5">Ref: {delivery.customerReference}</p>
              )}
            </div>
          </div>

          {/* Workflow Action Buttons */}
          <div className="flex items-center space-x-2">
            {delivery.status === 'DRAFT' && (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  Cancel Order
                </button>
                <button
                  onClick={handlePick}
                  disabled={isProcessing}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20"
                >
                  {isProcessing ? 'Picking...' : 'Pick Items'}
                </button>
              </>
            )}

            {delivery.status === 'PICKED' && (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  Cancel Order
                </button>
                <button
                  onClick={handlePack}
                  disabled={isProcessing}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20"
                >
                  {isProcessing ? 'Packing...' : 'Pack Items'}
                </button>
              </>
            )}

            {delivery.status === 'PACKED' && (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  Cancel Order
                </button>
                <button
                  onClick={handleValidate}
                  disabled={isProcessing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/20"
                >
                  {isProcessing ? 'Validating...' : 'Validate Delivery (Deduct Stock)'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Workflow Progress Stepper */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => {
              const state = getStepStatus(s.key);
              return (
                <React.Fragment key={s.key}>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        state === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : state === 'current'
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                          : state === 'cancelled'
                          ? 'bg-slate-200 text-slate-400'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {state === 'completed' ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        state === 'current'
                          ? 'text-indigo-600 font-bold'
                          : state === 'completed'
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-300 mx-2" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase text-slate-400 flex items-center space-x-1.5">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Customer Information</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{delivery.customerName}</div>
              {delivery.customerReference && (
                <div className="text-xs text-slate-500 mt-1">Ref: {delivery.customerReference}</div>
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase text-slate-400 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Source Location</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{delivery.sourceWarehouse?.name}</div>
              <div className="text-xs text-slate-500">Rack Location: <span className="font-bold text-slate-800">{delivery.sourceLocation?.name} ({delivery.sourceLocation?.code})</span></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase text-slate-400 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Audit Timeline</span>
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <div>Created: <span className="font-semibold text-slate-800">{new Date(delivery.createdAt).toLocaleString()}</span></div>
              {delivery.pickedAt && <div>Picked: <span className="font-semibold text-indigo-700">{new Date(delivery.pickedAt).toLocaleString()}</span></div>}
              {delivery.packedAt && <div>Packed: <span className="font-semibold text-blue-700">{new Date(delivery.packedAt).toLocaleString()}</span></div>}
              {delivery.validatedAt && <div>Validated: <span className="font-semibold text-emerald-700">{new Date(delivery.validatedAt).toLocaleString()}</span></div>}
              {delivery.cancelledAt && <div>Cancelled: <span className="font-semibold text-red-600">{new Date(delivery.cancelledAt).toLocaleString()}</span></div>}
            </div>
          </div>
        </div>

        {/* Line Items Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Delivery Items</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-right">Ordered Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {delivery.items && delivery.items.length > 0 ? (
                  delivery.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{item.productName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{item.sku}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-indigo-600">{item.quantity} units</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-6 text-center text-slate-400">No items in this delivery order.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
