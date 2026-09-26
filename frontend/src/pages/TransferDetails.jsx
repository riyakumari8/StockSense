import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import transferService from '../services/transferService';
import {
  ArrowRightLeft,
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

export default function TransferDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchTransfer();
  }, [id]);

  const fetchTransfer = async () => {
    setLoading(true);
    try {
      const data = await transferService.getById(id);
      setTransfer(data);
    } catch (err) {
      setError(err.message || 'Transfer not found');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!window.confirm(`Validate transfer ${transfer.transferNumber}? This will execute stock relocation.`)) return;
    try {
      await transferService.validate(id);
      setActionMsg('Transfer validated successfully! Stock levels updated across locations.');
      fetchTransfer();
    } catch (err) {
      setError(err.message || 'Validation failed');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(`Cancel draft transfer ${transfer.transferNumber}?`)) return;
    try {
      await transferService.cancel(id);
      setActionMsg('Transfer cancelled.');
      fetchTransfer();
    } catch (err) {
      setError(err.message || 'Cancel failed');
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Transfer Details">
        <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <span>Loading transfer details...</span>
        </div>
      </Layout>
    );
  }

  if (error || !transfer) {
    return (
      <Layout pageTitle="Transfer Details">
        <div className="bg-white rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto border border-slate-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Transfer Not Found</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <Link to="/transfers" className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Transfers</span>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={`Transfer: ${transfer.transferNumber}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link to="/transfers" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-indigo-600">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Transfers</span>
          </Link>

          {transfer.status === 'DRAFT' && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleValidate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md"
              >
                Validate Transfer
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Cancel Transfer
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

        {/* Transfer Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                {transfer.transferNumber}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">Internal Stock Transfer</h1>
              <p className="text-xs text-slate-500 mt-0.5">Reference: {transfer.reference || 'None'}</p>
            </div>

            <div>
              {transfer.status === 'VALIDATED' ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> VALIDATED
                </span>
              ) : transfer.status === 'CANCELLED' ? (
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

          {/* Locations Movement Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-slate-400">Source Location</p>
              <p className="text-sm font-bold text-slate-900">{transfer.sourceLocation?.name}</p>
              <p className="text-xs font-mono text-indigo-600">Warehouse: {transfer.sourceLocation?.warehouse?.name} ({transfer.sourceLocation?.warehouse?.code})</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-slate-400">Destination Location</p>
              <p className="text-sm font-bold text-slate-900">{transfer.destinationLocation?.name}</p>
              <p className="text-xs font-mono text-indigo-600">Warehouse: {transfer.destinationLocation?.warehouse?.name} ({transfer.destinationLocation?.warehouse?.code})</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Boxes className="w-4 h-4 text-indigo-600" />
              <span>Transferred Products ({transfer.items ? transfer.items.length : 0})</span>
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4 text-right">Transfer Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {transfer.items && transfer.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.product?.name}</td>
                      <td className="py-3 px-4 font-mono text-indigo-600">{item.product?.sku}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                        {item.quantity} {item.product?.unitOfMeasure}
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
              <span>Created by: {transfer.createdBy}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created: {transfer.createdAt ? new Date(transfer.createdAt).toLocaleString() : 'N/A'}</span>
            </span>
            {transfer.validatedAt && (
              <span className="flex items-center space-x-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Validated: {new Date(transfer.validatedAt).toLocaleString()}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
