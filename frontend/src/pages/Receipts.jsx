import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import receiptService from '../services/receiptService';
import supplierService from '../services/supplierService';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  Building2,
  Package,
  Layers,
  ArrowRight,
  Trash2,
  Check
} from 'lucide-react';

export default function Receipts() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');

  // Validation confirmation modal state
  const [validatingReceipt, setValidatingReceipt] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [receiptsData, suppliersData] = await Promise.all([
        receiptService.getAll({ search: searchQuery, status: selectedStatus, supplierId: selectedSupplier }),
        supplierService.getAll()
      ]);
      setReceipts(receiptsData);
      setSuppliers(suppliersData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load receipts data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (search = searchQuery, status = selectedStatus, suppId = selectedSupplier) => {
    setSearchQuery(search);
    setSelectedStatus(status);
    setSelectedSupplier(suppId);
    try {
      const data = await receiptService.getAll({
        search,
        status,
        supplierId: suppId
      });
      setReceipts(data);
    } catch (err) {
      setError(err.message || 'Failed to apply filters');
    }
  };

  const handleQuickValidate = async () => {
    if (!validatingReceipt) return;
    setIsValidating(true);
    try {
      await receiptService.validateReceipt(validatingReceipt.id);
      setSuccessMsg(`Receipt ${validatingReceipt.receiptNumber} successfully validated! Stock has been updated.`);
      setValidatingReceipt(null);
      handleFilterChange(searchQuery, selectedStatus, selectedSupplier);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(err.message || 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleDeleteReceipt = async (receipt) => {
    if (!window.confirm(`Are you sure you want to delete draft receipt "${receipt.receiptNumber}"?`)) {
      return;
    }
    try {
      await receiptService.deleteReceipt(receipt.id);
      setSuccessMsg(`Receipt ${receipt.receiptNumber} deleted successfully`);
      handleFilterChange(searchQuery, selectedStatus, selectedSupplier);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete receipt');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Metrics
  const totalReceipts = receipts.length;
  const validatedCount = receipts.filter(r => r.status === 'VALIDATED').length;
  const draftCount = receipts.filter(r => r.status === 'DRAFT').length;
  const totalUnitsReceived = receipts
    .filter(r => r.status === 'VALIDATED')
    .reduce((sum, r) => sum + (r.totalQuantity || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VALIDATED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Validated</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Cancelled</span>
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <Layout pageTitle="Stock Receipts">
      <div className="space-y-6">
        {/* Notifications */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header / Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Receipts & Inward Goods</h2>
            <p className="text-sm text-slate-500">
              Create and validate incoming vendor shipments to update live warehouse stock.
            </p>
          </div>
          <Link
            to="/receipts/new"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Receipt</span>
          </Link>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Receipts</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : totalReceipts}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Draft / Pending</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-amber-600" /> : draftCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Validated</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-emerald-600" /> : validatedCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Validated Units</p>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : totalUnitsReceived.toLocaleString()}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleFilterChange(e.target.value, selectedStatus, selectedSupplier)}
              placeholder="Search by receipt number (e.g. RCV-0001) or supplier..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-44">
              <select
                value={selectedStatus}
                onChange={(e) => handleFilterChange(searchQuery, e.target.value, selectedSupplier)}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="VALIDATED">Validated</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="relative flex-1 md:w-56">
              <select
                value={selectedSupplier}
                onChange={(e) => handleFilterChange(searchQuery, selectedStatus, e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.supplierName}
                  </option>
                ))}
              </select>
            </div>

            {(searchQuery || selectedStatus || selectedSupplier) && (
              <button
                type="button"
                onClick={() => handleFilterChange('', '', '')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Receipts Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500 font-medium">Loading receipts records...</p>
            </div>
          ) : receipts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No receipts found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery || selectedStatus || selectedSupplier
                  ? 'No receipts match your filter criteria.'
                  : 'Receive incoming stock shipments by creating your first receipt.'}
              </p>
              {!searchQuery && !selectedStatus && !selectedSupplier && (
                <Link
                  to="/receipts/new"
                  className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Receipt</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Receipt #</th>
                    <th className="px-6 py-4">Supplier</th>
                    <th className="px-6 py-4 text-center">Products</th>
                    <th className="px-6 py-4 text-center">Total Quantity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created Date</th>
                    <th className="px-6 py-4">Validated Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receipts.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/receipts/${r.id}`}
                          className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1.5"
                        >
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <span>{r.receiptNumber}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-800">
                            {r.supplier?.supplierName || 'Unknown Supplier'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-700">
                        {r.totalItems || (r.items ? r.items.length : 0)} items
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-900">
                        {r.totalQuantity} units
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(r.status)}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {r.validatedAt ? (
                          <span className="text-emerald-700 font-medium">
                            {new Date(r.validatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {r.status === 'DRAFT' && (
                            <button
                              onClick={() => setValidatingReceipt(r)}
                              title="Validate Receipt"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Validate</span>
                            </button>
                          )}
                          <Link
                            to={`/receipts/${r.id}`}
                            title="View Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {r.status === 'DRAFT' && (
                            <button
                              onClick={() => handleDeleteReceipt(r)}
                              title="Delete Draft"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Validate Confirmation Modal */}
      {validatingReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/80 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Validate Receipt {validatingReceipt.receiptNumber}?
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Validating this receipt will permanently commit stock changes:
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700">
              <p>• Supplier: <strong>{validatingReceipt.supplier?.supplierName}</strong></p>
              <p>• Total Quantity to Inward: <strong>+{validatingReceipt.totalQuantity} units</strong></p>
              <p>• Product stock levels will increase immediately.</p>
              <p>• Immutable stock ledger records will be created.</p>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setValidatingReceipt(null)}
                disabled={isValidating}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuickValidate}
                disabled={isValidating}
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-60"
              >
                {isValidating && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Confirm & Validate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
