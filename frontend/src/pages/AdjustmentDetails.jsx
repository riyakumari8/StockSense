import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import adjustmentService from '../services/adjustmentService';
import {
  Sliders,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  Boxes
} from 'lucide-react';

export default function AdjustmentDetails() {
  const { id } = useParams();

  const [adjustment, setAdjustment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchAdjustment();
  }, [id]);

  const fetchAdjustment = async () => {
    setLoading(true);
    try {
      const data = await adjustmentService.getById(id);
      setAdjustment(data);
    } catch (err) {
      setError(err.message || 'Adjustment not found');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!window.confirm(`Validate stock adjustment ${adjustment.adjustmentNumber}? Physical counts will overwrite current stock.`)) return;
    try {
      await adjustmentService.validate(id);
      setActionMsg('Adjustment validated successfully! System stock reconciled with physical count.');
      fetchAdjustment();
    } catch (err) {
      setError(err.message || 'Validation failed');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(`Cancel draft adjustment ${adjustment.adjustmentNumber}?`)) return;
    try {
      await adjustmentService.cancel(id);
      setActionMsg('Adjustment cancelled.');
      fetchAdjustment();
    } catch (err) {
      setError(err.message || 'Cancel failed');
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Adjustment Details">
        <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <span>Loading adjustment details...</span>
        </div>
      </Layout>
    );
  }

  if (error || !adjustment) {
    return (
      <Layout pageTitle="Adjustment Details">
        <div className="bg-white rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto border border-slate-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Adjustment Not Found</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <Link to="/adjustments" className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Adjustments</span>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={`Adjustment: ${adjustment.adjustmentNumber}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link to="/adjustments" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-indigo-600">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Adjustments</span>
          </Link>

          {adjustment.status === 'DRAFT' && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleValidate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md"
              >
                Validate Adjustment
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Cancel Adjustment
              </button>
            </div>
          )}
        </div>

        {actionMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Card Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                {adjustment.adjustmentNumber}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">Stock Inventory Adjustment</h1>
              <p className="text-xs text-slate-500 mt-0.5">Reason: {adjustment.reason || 'Physical Audit'}</p>
            </div>

            <div>
              {adjustment.status === 'VALIDATED' ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> VALIDATED
                </span>
              ) : adjustment.status === 'CANCELLED' ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-500">
                  <XCircle className="w-4 h-4 mr-1.5 text-slate-400" /> CANCELLED
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-800">
                  <Clock className="w-4 h-4 mr-1.5 text-amber-600" /> DRAFT (Unvalidated)
                </span>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <p className="text-xs font-semibold uppercase text-slate-400">Target Location</p>
            <p className="text-sm font-bold text-slate-900">{adjustment.location?.name}</p>
            <p className="text-xs font-mono text-indigo-600">Warehouse: {adjustment.location?.warehouse?.name} ({adjustment.location?.warehouse?.code})</p>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Boxes className="w-4 h-4 text-indigo-600" />
              <span>Reconciled Items ({adjustment.items ? adjustment.items.length : 0})</span>
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">System Count</th>
                    <th className="py-3 px-4">Physical Count</th>
                    <th className="py-3 px-4 text-right">Variance Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {adjustment.items && adjustment.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.product?.name} <span className="font-mono text-indigo-600 font-normal">({item.product?.sku})</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">{item.systemQuantity} {item.product?.unitOfMeasure}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.physicalQuantity} {item.product?.unitOfMeasure}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-extrabold ${item.difference < 0 ? 'text-red-600' : item.difference > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {item.difference > 0 ? `+${item.difference}` : item.difference} {item.product?.unitOfMeasure}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
            <span className="flex items-center space-x-1">
              <User className="w-3.5 h-3.5" />
              <span>Created by: {adjustment.createdBy}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created: {adjustment.createdAt ? new Date(adjustment.createdAt).toLocaleString() : 'N/A'}</span>
            </span>
            {adjustment.validatedAt && (
              <span className="flex items-center space-x-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Validated: {new Date(adjustment.validatedAt).toLocaleString()}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
