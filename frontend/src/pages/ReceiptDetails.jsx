import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import receiptService from '../services/receiptService';
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Calendar,
  Package,
  Layers,
  DollarSign,
  ArrowLeft,
  Check,
  X,
  Pencil,
  Printer,
  AlertTriangle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Boxes
} from 'lucide-react';

export default function ReceiptDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Confirmation Modals
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    setLoading(true);
    try {
      const data = await receiptService.getById(id);
      setReceipt(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load receipt details');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      const updated = await receiptService.validateReceipt(id);
      setReceipt(updated);
      setShowValidateModal(false);
      setSuccessMsg(`Receipt ${updated.receiptNumber} successfully validated! Product stock levels have been updated.`);
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      alert(err.message || 'Failed to validate receipt');
    } finally {
      setValidating(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const updated = await receiptService.cancelReceipt(id);
      setReceipt(updated);
      setShowCancelModal(false);
      setSuccessMsg(`Receipt ${updated.receiptNumber} has been cancelled.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(err.message || 'Failed to cancel receipt');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Layout pageTitle="Receipt Details">
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500 font-medium">Loading receipt record...</p>
        </div>
      </Layout>
    );
  }

  if (error || !receipt) {
    return (
      <Layout pageTitle="Receipt Details">
        <div className="max-w-xl mx-auto py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Receipt Not Found</h2>
          <p className="text-sm text-slate-500">{error || 'The requested receipt could not be retrieved.'}</p>
          <Link
            to="/receipts"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Receipts List</span>
          </Link>
        </div>
      </Layout>
    );
  }

  const isDraft = receipt.status === 'DRAFT';
  const isValidated = receipt.status === 'VALIDATED';
  const isCancelled = receipt.status === 'CANCELLED';

  return (
    <Layout pageTitle={`Receipt ${receipt.receiptNumber}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            to="/receipts"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Receipts</span>
          </Link>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Slip</span>
            </button>

            {isDraft && (
              <>
                <Link
                  to={`/receipts/${receipt.id}/edit`}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-colors"
                >
                  <Pencil className="w-4 h-4 text-slate-500" />
                  <span>Edit Draft</span>
                </Link>

                <button
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold shadow-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>

                <button
                  onClick={() => setShowValidateModal(true)}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Validate Receipt</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Success / Error Alerts */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Validation Status Banner */}
        {isValidated && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-emerald-900 text-sm">
                  Stock Receipt Validated & Committed
                </p>
                <p className="text-xs text-emerald-700">
                  Stock levels were increased for all line items and registered in the Stock Ledger on{' '}
                  {new Date(receipt.validatedAt).toLocaleString()}.
                </p>
              </div>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
            >
              View Updated Products →
            </Link>
          </div>
        )}

        {isDraft && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-amber-900 text-sm">Draft Receipt — Stock Not Yet Updated</p>
                <p className="text-xs text-amber-700">
                  Products are in draft state. Inventory stock will only increase after you click <strong>Validate Receipt</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowValidateModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm"
            >
              Validate Now
            </button>
          </div>
        )}

        {/* Primary Info Header Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-extrabold text-slate-900">{receipt.receiptNumber}</h1>
                  {receipt.status === 'VALIDATED' && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Validated</span>
                    </span>
                  )}
                  {receipt.status === 'DRAFT' && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Draft</span>
                    </span>
                  )}
                  {receipt.status === 'CANCELLED' && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cancelled</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Created on {new Date(receipt.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Total Products</p>
                <p className="text-lg font-bold text-slate-800">{receipt.totalItems} Items</p>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Total Inward Units</p>
                <p className="text-lg font-extrabold text-indigo-600">{receipt.totalQuantity} Units</p>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Total Valuation</p>
                <p className="text-lg font-bold text-slate-900">${(receipt.totalAmount || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Supplier & Receipt Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supplier Details */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-3">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm border-b border-slate-200/50 pb-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Vendor / Supplier Information</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="font-bold text-sm text-slate-900">{receipt.supplier?.supplierName}</p>
                {receipt.supplier?.contactPerson && (
                  <p className="flex items-center space-x-1.5">
                    <span className="text-slate-400">Contact:</span>
                    <span>{receipt.supplier.contactPerson}</span>
                  </p>
                )}
                {receipt.supplier?.phone && (
                  <p className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{receipt.supplier.phone}</span>
                  </p>
                )}
                {receipt.supplier?.email && (
                  <p className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{receipt.supplier.email}</span>
                  </p>
                )}
                {receipt.supplier?.address && (
                  <p className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{receipt.supplier.address}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Receipt Timeline */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-3">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm border-b border-slate-200/50 pb-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Receipt Timeline & Remarks</span>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Creation Date:</span>
                  <span className="font-medium text-slate-700">
                    {new Date(receipt.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Validation Date:</span>
                  <span className="font-medium text-slate-700">
                    {receipt.validatedAt ? new Date(receipt.validatedAt).toLocaleString() : 'Not yet validated'}
                  </span>
                </div>
                {receipt.notes && (
                  <div className="pt-2 border-t border-slate-200/50">
                    <span className="text-slate-400 block mb-0.5 font-semibold">Remarks / Notes:</span>
                    <p className="text-slate-800 italic">{receipt.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Items Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Line Items & Quantities</h3>
            <span className="text-xs font-semibold text-slate-500">
              {receipt.items?.length || 0} product lines
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Item #</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">SKU Code</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Quantity Inward</th>
                  <th className="px-6 py-4">Unit of Measure</th>
                  <th className="px-6 py-4 text-right">Unit Price</th>
                  <th className="px-6 py-4 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipt.items?.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <span>{item.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                        {item.productSku}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {item.categoryName || 'General'}
                    </td>
                    <td className="px-6 py-4 text-center font-extrabold text-indigo-600 text-base">
                      +{item.quantity}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {item.unitOfMeasure || 'Units'}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-800">
                      ${item.unitPrice ? parseFloat(item.unitPrice).toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      ${item.subtotal ? parseFloat(item.subtotal).toFixed(2) : '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/80 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-right text-xs uppercase text-slate-500">
                    Totals:
                  </td>
                  <td className="px-6 py-4 text-center text-indigo-700 text-base">
                    {receipt.totalQuantity} units
                  </td>
                  <td colSpan="2" className="px-6 py-4 text-right text-xs uppercase text-slate-500">
                    Grand Total:
                  </td>
                  <td className="px-6 py-4 text-right text-slate-900 text-base">
                    ${(receipt.totalAmount || 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Validate Receipt Confirmation Modal */}
      {showValidateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/80 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Confirm Receipt Validation
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Validating <strong>{receipt.receiptNumber}</strong> will immediately apply these inventory changes in a single atomic transaction:
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 text-slate-700 border border-slate-200/60">
              <div className="flex justify-between font-medium">
                <span>Vendor:</span>
                <span className="font-bold text-slate-900">{receipt.supplier?.supplierName}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total Quantity to Inward:</span>
                <span className="font-extrabold text-emerald-600">+{receipt.totalQuantity} Units</span>
              </div>
              <p className="text-slate-500 pt-1 border-t border-slate-200/50">
                • Stock levels for {receipt.items?.length} product(s) will increase.
              </p>
              <p className="text-slate-500">
                • Immutable stock ledger entries will be recorded with reference #{receipt.receiptNumber}.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowValidateModal(false)}
                disabled={validating}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleValidate}
                disabled={validating}
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-60"
              >
                {validating && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Validate & Update Stock</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Receipt Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/80 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Cancel Receipt {receipt.receiptNumber}?
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to cancel this draft receipt? Cancelled receipts cannot be validated or re-opened.
            </p>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Keep Draft
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md shadow-red-600/20 disabled:opacity-60"
              >
                {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Yes, Cancel Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
