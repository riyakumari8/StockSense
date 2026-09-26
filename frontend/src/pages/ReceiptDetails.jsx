import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import receiptService from '../services/receiptService';
import {
  PackageCheck,
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
  DollarSign
} from 'lucide-react';

export default function ReceiptDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchReceiptDetails();
  }, [id]);

  const fetchReceiptDetails = async () => {
    setLoading(true);
    try {
      const data = await receiptService.getById(id);
      setReceipt(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch receipt details');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!window.confirm(`Validate receipt "${receipt.receiptNumber}"? Stock quantities will be immediately updated in inventory.`)) return;

    setIsProcessing(true);
    try {
      const updated = await receiptService.validate(id);
      setReceipt(updated);
      setSuccessMsg(`Receipt "${receipt.receiptNumber}" validated! Product inventory updated successfully.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to validate receipt');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(`Cancel receipt "${receipt.receiptNumber}"?`)) return;

    setIsProcessing(true);
    try {
      const updated = await receiptService.cancel(id);
      setReceipt(updated);
      setSuccessMsg(`Receipt "${receipt.receiptNumber}" cancelled.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to cancel receipt');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Receipt Details">
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-500 flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <span>Loading receipt details...</span>
        </div>
      </Layout>
    );
  }

  if (error || !receipt) {
    return (
      <Layout pageTitle="Receipt Details">
        <div className="space-y-4">
          <Link to="/receipts" className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-600 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Receipts</span>
          </Link>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error || 'Receipt not found.'}</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={`Receipt ${receipt.receiptNumber}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-3">
            <Link
              to="/receipts"
              className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-mono font-bold text-indigo-600">{receipt.receiptNumber}</h2>
                {receipt.status === 'VALIDATED' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> VALIDATED
                  </span>
                ) : receipt.status === 'CANCELLED' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                    <XCircle className="w-3.5 h-3.5 mr-1" /> CANCELLED
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    <Clock className="w-3.5 h-3.5 mr-1" /> DRAFT
                  </span>
                )}
              </div>
              {receipt.reference && (
                <p className="text-xs text-slate-500 mt-0.5">Reference: {receipt.reference}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {receipt.status === 'DRAFT' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Cancel Receipt
              </button>
              <button
                onClick={handleValidate}
                disabled={isProcessing}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/20"
              >
                {isProcessing ? 'Validating...' : 'Validate Receipt (Add Stock)'}
              </button>
            </div>
          )}
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Metadata Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Supplier Info Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase text-slate-400 flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Supplier Details</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{receipt.supplier?.name}</div>
              <div className="font-mono text-xs font-bold text-indigo-600">{receipt.supplier?.code}</div>
              {receipt.supplier?.contactPerson && (
                <div className="text-xs text-slate-500 mt-1">Contact: {receipt.supplier.contactPerson}</div>
              )}
              {receipt.supplier?.email && (
                <div className="text-xs text-slate-500">{receipt.supplier.email}</div>
              )}
            </div>
          </div>

          {/* Warehouse & Location Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase text-slate-400 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Receiving Location</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{receipt.warehouse?.name}</div>
              <div className="text-xs text-slate-500">Rack Location: <span className="font-bold text-slate-800">{receipt.destinationLocation?.name} ({receipt.destinationLocation?.code})</span></div>
            </div>
          </div>

          {/* Receipt Audit Metadata */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase text-slate-400 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Audit Info</span>
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <div>Created By: <span className="font-semibold text-slate-800">{receipt.createdBy || 'System'}</span></div>
              <div>Created Date: <span className="font-semibold text-slate-800">{new Date(receipt.createdAt).toLocaleString()}</span></div>
              {receipt.validatedAt && (
                <div>Validated Date: <span className="font-semibold text-emerald-700">{new Date(receipt.validatedAt).toLocaleString()}</span></div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Received Items</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Unit Cost ($)</th>
                  <th className="py-3 px-4 text-right">Subtotal ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {receipt.items && receipt.items.length > 0 ? (
                  receipt.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{item.productName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{item.sku}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-indigo-600">{item.quantity} units</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                        ${Number(item.unitCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ${Number(item.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">No items on this receipt.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total Cost Summary */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-64 space-y-1 text-right">
              <div className="text-xs text-slate-500 font-semibold uppercase">Total Receipt Cost</div>
              <div className="text-2xl font-bold text-indigo-600">
                ${Number(receipt.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
