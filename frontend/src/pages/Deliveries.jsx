import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import deliveryService from '../services/deliveryService';
import warehouseService from '../services/warehouseService';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Eye,
  Filter,
  PackageCheck,
  Box,
  Send
} from 'lucide-react';

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter, warehouseFilter, search]);

  const fetchWarehouses = async () => {
    try {
      const whData = await warehouseService.getAll();
      setWarehouses(whData);
    } catch (err) {
      console.error('Failed to load warehouses for filter:', err);
    }
  };

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const data = await deliveryService.getAll({
        status: statusFilter,
        warehouseId: warehouseFilter,
        search
      });
      setDeliveries(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch delivery orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePick = async (id, num) => {
    try {
      await deliveryService.pick(id);
      setSuccessMsg(`Delivery "${num}" picked successfully! Status set to PICKED.`);
      fetchDeliveries();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Pick operation failed');
    }
  };

  const handlePack = async (id, num) => {
    try {
      await deliveryService.pack(id);
      setSuccessMsg(`Delivery "${num}" packed successfully! Status set to PACKED.`);
      fetchDeliveries();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Pack operation failed');
    }
  };

  const handleValidate = async (id, num) => {
    if (!window.confirm(`Validate delivery "${num}"? Stock will be permanently deducted from the source location.`)) return;

    try {
      await deliveryService.validate(id);
      setSuccessMsg(`Delivery "${num}" validated! Inventory stock deducted successfully.`);
      fetchDeliveries();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Delivery validation failed');
    }
  };

  const handleCancel = async (id, num) => {
    if (!window.confirm(`Cancel delivery "${num}"?`)) return;

    try {
      await deliveryService.cancel(id);
      setSuccessMsg(`Delivery "${num}" cancelled.`);
      fetchDeliveries();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to cancel delivery');
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'VALIDATED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> VALIDATED
          </span>
        );
      case 'PACKED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Box className="w-3.5 h-3.5 mr-1" /> PACKED
          </span>
        );
      case 'PICKED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            <PackageCheck className="w-3.5 h-3.5 mr-1" /> PICKED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
            <XCircle className="w-3.5 h-3.5 mr-1" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 mr-1" /> DRAFT
          </span>
        );
    }
  };

  return (
    <Layout pageTitle="Delivery Orders">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              <span>Delivery Orders (Outgoing Stock)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Fulfill customer shipments through structured Pick → Pack → Validate workflow with transactional stock deductions.
            </p>
          </div>

          <Link
            to="/deliveries/create"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Delivery</span>
          </Link>
        </div>

        {/* Alerts */}
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

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search delivery #, customer name, ref..."
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
              <option value="">All Workflow Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PICKED">PICKED</option>
              <option value="PACKED">PACKED</option>
              <option value="VALIDATED">VALIDATED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="">All Source Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <span>Loading delivery orders...</span>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No delivery orders found matching filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3.5 px-6">Delivery Number</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Source Location</th>
                    <th className="py-3.5 px-6">Line Items</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {deliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/60">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-600">
                        <Link to={`/deliveries/${d.id}`} className="hover:underline">
                          {d.deliveryNumber}
                        </Link>
                        {d.customerReference && (
                          <div className="font-sans text-[11px] font-normal text-slate-400">Ref: {d.customerReference}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-slate-900">
                        {d.customerName}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-700">
                        <div>{d.sourceWarehouse?.name}</div>
                        <div className="text-[11px] text-slate-400 font-semibold">{d.sourceLocation?.name}</div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {d.items ? d.items.length : 0} product(s)
                      </td>
                      <td className="py-4 px-6">
                        {renderStatusBadge(d.status)}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          to={`/deliveries/${d.id}`}
                          className="p-1.5 inline-block rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          title="View Delivery Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {d.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => handlePick(d.id, d.deliveryNumber)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs"
                            >
                              Pick
                            </button>
                            <button
                              onClick={() => handleCancel(d.id, d.deliveryNumber)}
                              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {d.status === 'PICKED' && (
                          <>
                            <button
                              onClick={() => handlePack(d.id, d.deliveryNumber)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs"
                            >
                              Pack
                            </button>
                            <button
                              onClick={() => handleCancel(d.id, d.deliveryNumber)}
                              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {d.status === 'PACKED' && (
                          <>
                            <button
                              onClick={() => handleValidate(d.id, d.deliveryNumber)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs"
                            >
                              Validate
                            </button>
                            <button
                              onClick={() => handleCancel(d.id, d.deliveryNumber)}
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
