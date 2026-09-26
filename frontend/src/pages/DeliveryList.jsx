import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import deliveryService from '../services/deliveryService';
import {
  Truck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  AlertTriangle,
  ArrowRight,
  Package,
  CheckCircle2,
  Clock,
  Box,
  Layers
} from 'lucide-react';

export default function DeliveryList() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  // Quick Action Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: 'pick', // 'pick' | 'pack' | 'validate'
    delivery: null,
    isLoading: false
  });

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await deliveryService.getDeliveries(searchQuery, selectedStatus);
      setDeliveries(data);
    } catch (err) {
      setError(err.message || 'Failed to load delivery orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchDeliveries();
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedStatus]);

  const showToast = (message, isError = false) => {
    setToastMessage({ message, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleQuickAction = async () => {
    const { type, delivery } = actionModal;
    if (!delivery) return;

    try {
      setActionModal(prev => ({ ...prev, isLoading: true }));
      let updatedDelivery;

      if (type === 'pick') {
        updatedDelivery = await deliveryService.pickDelivery(delivery.id);
        showToast(`Delivery ${updatedDelivery.deliveryNumber} successfully picked! Ready for packaging.`);
      } else if (type === 'pack') {
        updatedDelivery = await deliveryService.packDelivery(delivery.id);
        showToast(`Delivery ${updatedDelivery.deliveryNumber} packed! Ready for final validation.`);
      } else if (type === 'validate') {
        updatedDelivery = await deliveryService.validateDelivery(delivery.id);
        showToast(`Delivery ${updatedDelivery.deliveryNumber} validated! Stock has been deducted and movement recorded.`);
      }

      setActionModal({ isOpen: false, type: 'pick', delivery: null, isLoading: false });
      fetchDeliveries();
    } catch (err) {
      setActionModal(prev => ({ ...prev, isLoading: false }));
      showToast(err.message || `Failed to execute ${type} operation`, true);
    }
  };

  // Metrics summary
  const metrics = {
    total: deliveries.length,
    draft: deliveries.filter(d => d.status === 'DRAFT').length,
    picked: deliveries.filter(d => d.status === 'PICKED').length,
    packed: deliveries.filter(d => d.status === 'PACKED').length,
    validated: deliveries.filter(d => d.status === 'VALIDATED').length
  };

  const statusTabs = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'DRAFT', label: 'Draft' },
    { key: 'PICKED', label: 'Picked' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'VALIDATED', label: 'Validated' },
    { key: 'CANCELLED', label: 'Cancelled' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 duration-200">
          <div
            className={`p-4 rounded-xl shadow-xl flex items-center space-x-3 border ${
              toastMessage.isError
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {toastMessage.isError ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{toastMessage.message}</p>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                Operations & Outbound
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <Truck className="w-7 h-7 text-indigo-600" />
              Delivery Orders
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage the end-to-end outbound warehouse lifecycle: Pick items, Pack parcels, and Validate stock dispatch.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDeliveries}
              title="Refresh delivery list"
              className="p-2.5 rounded-xl border border-slate-300 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            <Link
              to="/deliveries/create"
              className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2 stroke-[2.5]" />
              Create Delivery
            </Link>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            onClick={() => setSelectedStatus('DRAFT')}
            className={`cursor-pointer p-4 bg-white rounded-2xl border transition-all ${
              selectedStatus === 'DRAFT' ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>To Pick</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{metrics.draft}</p>
            <p className="text-xs text-slate-400 mt-1">Draft orders pending picking</p>
          </div>

          <div
            onClick={() => setSelectedStatus('PICKED')}
            className={`cursor-pointer p-4 bg-white rounded-2xl border transition-all ${
              selectedStatus === 'PICKED' ? 'border-sky-500 ring-2 ring-sky-100' : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-sky-600 mb-1">
              <span>To Pack</span>
              <Layers className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-2xl font-bold text-sky-900">{metrics.picked}</p>
            <p className="text-xs text-sky-600/70 mt-1">Picked items ready for packing</p>
          </div>

          <div
            onClick={() => setSelectedStatus('PACKED')}
            className={`cursor-pointer p-4 bg-white rounded-2xl border transition-all ${
              selectedStatus === 'PACKED' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-amber-700 mb-1">
              <span>To Validate</span>
              <Box className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-900">{metrics.packed}</p>
            <p className="text-xs text-amber-600/80 mt-1">Packed & awaiting dispatch</p>
          </div>

          <div
            onClick={() => setSelectedStatus('VALIDATED')}
            className={`cursor-pointer p-4 bg-white rounded-2xl border transition-all ${
              selectedStatus === 'VALIDATED' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 mb-1">
              <span>Validated</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-900">{metrics.validated}</p>
            <p className="text-xs text-emerald-600/80 mt-1">Stock deducted & ledgered</p>
          </div>
        </div>

        {/* Filter and Search Bar Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Delivery # or Customer..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedStatus === tab.key
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
            <h3 className="text-base font-bold text-rose-900">Failed to load delivery orders</h3>
            <p className="text-sm text-rose-600 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchDeliveries}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Deliveries Table Card */}
        {!error && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading && deliveries.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-sm text-slate-500">Retrieving delivery orders from database...</p>
              </div>
            ) : deliveries.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                  <Truck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">No delivery orders found</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                    {searchQuery || selectedStatus !== 'ALL'
                      ? 'Try adjusting your search criteria or status filter to find matching orders.'
                      : 'Create your first delivery order to start the warehouse picking, packing, and validation workflow.'}
                  </p>
                </div>
                <Link
                  to="/deliveries/create"
                  className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create New Delivery
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Delivery Number</th>
                      <th className="py-3.5 px-6">Customer</th>
                      <th className="py-3.5 px-6 text-center">Items</th>
                      <th className="py-3.5 px-6 text-center">Total Quantity</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6">Created Date</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {deliveries.map((delivery) => (
                      <tr
                        key={delivery.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/deliveries/${delivery.id}`)}
                      >
                        {/* Delivery ID / Number */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-indigo-600 group-hover:text-indigo-800">
                              {delivery.deliveryNumber}
                            </span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-900 leading-tight">
                            {delivery.customerName}
                          </p>
                        </td>

                        {/* Number of Items */}
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                            {delivery.totalItems || delivery.items?.length || 0} items
                          </span>
                        </td>

                        {/* Total Quantity */}
                        <td className="py-4 px-6 text-center font-semibold text-slate-800">
                          {delivery.totalQuantity ?? 0}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <StatusBadge status={delivery.status} size="sm" />
                        </td>

                        {/* Created Date */}
                        <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                          {delivery.createdAt
                            ? new Date(delivery.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '—'}
                        </td>

                        {/* Actions */}
                        <td
                          className="py-4 px-6 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end space-x-2">
                            {/* Workflow Quick Action Buttons */}
                            {delivery.status === 'DRAFT' && (
                              <button
                                onClick={() => setActionModal({
                                  isOpen: true,
                                  type: 'pick',
                                  delivery,
                                  isLoading: false
                                })}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
                              >
                                Pick
                              </button>
                            )}

                            {delivery.status === 'PICKED' && (
                              <button
                                onClick={() => setActionModal({
                                  isOpen: true,
                                  type: 'pack',
                                  delivery,
                                  isLoading: false
                                })}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                              >
                                Pack
                              </button>
                            )}

                            {delivery.status === 'PACKED' && (
                              <button
                                onClick={() => setActionModal({
                                  isOpen: true,
                                  type: 'validate',
                                  delivery,
                                  isLoading: false
                                })}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Validate
                              </button>
                            )}

                            <Link
                              to={`/deliveries/${delivery.id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal for Quick Action Buttons */}
      <ConfirmationModal
        isOpen={actionModal.isOpen}
        isLoading={actionModal.isLoading}
        type={
          actionModal.type === 'validate'
            ? 'success'
            : actionModal.type === 'pack'
            ? 'warning'
            : 'info'
        }
        title={
          actionModal.type === 'pick'
            ? `Confirm Picking: ${actionModal.delivery?.deliveryNumber}`
            : actionModal.type === 'pack'
            ? `Confirm Packing: ${actionModal.delivery?.deliveryNumber}`
            : `Confirm Validation & Stock Deduction: ${actionModal.delivery?.deliveryNumber}`
        }
        message={
          actionModal.type === 'pick'
            ? `Are you sure you want to mark delivery order ${actionModal.delivery?.deliveryNumber} as PICKED? This verifies required inventory is available. Stock will NOT decrease until final validation.`
            : actionModal.type === 'pack'
            ? `Are you sure you want to mark delivery order ${actionModal.delivery?.deliveryNumber} as PACKED? All items will be bundled for shipment. Stock will NOT decrease until final validation.`
            : `Are you sure you want to VALIDATE delivery order ${actionModal.delivery?.deliveryNumber}? This is the final step: physical stock will be permanently deducted from warehouse inventory and recorded in the Stock Ledger.`
        }
        confirmText={
          actionModal.type === 'pick'
            ? 'Confirm Pick'
            : actionModal.type === 'pack'
            ? 'Confirm Pack'
            : 'Validate & Deduct Stock'
        }
        onConfirm={handleQuickAction}
        onCancel={() => setActionModal({ isOpen: false, type: 'pick', delivery: null, isLoading: false })}
      />
    </div>
  );
}
