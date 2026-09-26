import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import receiptService from '../services/receiptService';
import supplierService from '../services/supplierService';
import warehouseService from '../services/warehouseService';
import {
  PackageCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Eye,
  Filter,
  DollarSign
} from 'lucide-react';

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [statusFilter, supplierFilter, warehouseFilter, search]);

  const fetchInitialData = async () => {
    try {
      const [supData, whData] = await Promise.all([
        supplierService.getAll(),
        warehouseService.getAll()
      ]);
      setSuppliers(supData);
      setWarehouses(whData);
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  };

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const data = await receiptService.getAll({
        status: statusFilter,
        supplierId: supplierFilter,
        warehouseId: warehouseFilter,
        search
      });
      setReceipts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id, receiptNumber) => {
    if (!window.confirm(`Validate receipt "${receiptNumber}"? This will add incoming stock to inventory.`)) return;

    try {
      await receiptService.validate(id);
      setSuccessMsg(`Receipt "${receiptNumber}" validated! Inventory stock updated successfully.`);
      fetchReceipts();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Receipt validation failed');
    }
  };

  const handleCancel = async (id, receiptNumber) => {
    if (!window.confirm(`Cancel draft receipt "${receiptNumber}"?`)) return;

    try {
      await receiptService.cancel(id);
      setSuccessMsg(`Receipt "${receiptNumber}" cancelled.`);
      fetchReceipts();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to cancel receipt');
    }
  };

  return (
    <Layout pageTitle="Receipts & Incoming Stock">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <PackageCheck className="w-5 h-5 text-indigo-600" />
              <span>Stock Receipts (Goods Received)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Receive goods from suppliers, record purchase costs, and validate incoming stock into warehouse locations.
            </p>
          </div>

          <Link
            to="/receipts/new"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Receipt</span>
          </Link>
        </div>

        {/* Status Alerts */}
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

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search reference or receipt number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="VALIDATED">VALIDATED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>

            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Receipts Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <span>Loading receipts...</span>
            </div>
          ) : receipts.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No stock receipts found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3.5 px-6">Receipt Number</th>
                    <th className="py-3.5 px-6">Supplier</th>
                    <th className="py-3.5 px-6">Warehouse & Location</th>
                    <th className="py-3.5 px-6">Total Items</th>
                    <th className="py-3.5 px-6">Total Value</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {receipts.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-600">
                        <Link to={`/receipts/${r.id}`} className="hover:underline">
                          {r.receiptNumber}
                        </Link>
                        {r.reference && (
                          <div className="font-sans text-[11px] font-normal text-slate-400">Ref: {r.reference}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-slate-800">
                        {r.supplier?.name} <span className="font-mono text-slate-400">({r.supplier?.code})</span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-700">
                        <div>{r.warehouse?.name}</div>
                        <div className="text-[11px] text-slate-400 font-semibold">{r.destinationLocation?.name}</div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {r.items ? r.items.length : 0} line item(s)
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-900">
                        ${Number(r.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6">
                        {r.status === 'VALIDATED' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> VALIDATED
                          </span>
                        ) : r.status === 'CANCELLED' ? (
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
                          to={`/receipts/${r.id}`}
                          className="p-1.5 inline-block rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          title="View Receipt Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {r.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => handleValidate(r.id, r.receiptNumber)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs"
                            >
                              Validate
                            </button>
                            <button
                              onClick={() => handleCancel(r.id, r.receiptNumber)}
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
    </Layout>
  );
}
