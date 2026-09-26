import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import WorkflowProgressBar from '../components/WorkflowProgressBar';
import ConfirmationModal from '../components/ConfirmationModal';
import deliveryService from '../services/deliveryService';
import {
  Truck,
  ArrowLeft,
  Calendar,
  User,
  Package,
  CheckCircle2,
  Box,
  Layers,
  AlertTriangle,
  FileText,
  Clock,
  RefreshCw,
  Printer,
  History,
  XCircle
} from 'lucide-react';

export default function DeliveryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Modal action states
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: 'pick', // 'pick' | 'pack' | 'validate' | 'cancel'
    isLoading: false
  });

  const fetchDeliveryDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await deliveryService.getDeliveryById(id);
      setDelivery(data);

      if (data.status === 'VALIDATED') {
        const ledgerData = await deliveryService.getDeliveryLedger(id).catch(() => []);
        setLedgerEntries(ledgerData);
      }
    } catch (err) {
      setError(err.message || 'Failed to load delivery order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDeliveryDetails();
    }
  }, [id]);

  const showToast = (message, isError = false) => {
    setToastMessage({ message, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleExecuteWorkflowAction = async () => {
    const { type } = actionModal;
    try {
      setActionModal(prev => ({ ...prev, isLoading: true }));
      let updated;

      if (type === 'pick') {
        updated = await deliveryService.pickDelivery(id);
        showToast(`Delivery ${updated.deliveryNumber} marked as PICKED! Required stock is verified.`);
      } else if (type === 'pack') {
        updated = await deliveryService.packDelivery(id);
        showToast(`Delivery ${updated.deliveryNumber} marked as PACKED! Packages are ready for dispatch.`);
      } else if (type === 'validate') {
        updated = await deliveryService.validateDelivery(id);
        showToast(`Delivery ${updated.deliveryNumber} VALIDATED! Stock has decreased in warehouse inventory and audit ledger is recorded.`);
      } else if (type === 'cancel') {
        updated = await deliveryService.cancelDelivery(id);
        showToast(`Delivery ${updated.deliveryNumber} has been CANCELLED.`, true);
      }

      setActionModal({ isOpen: false, type: 'pick', isLoading: false });
      await fetchDeliveryDetails();
    } catch (err) {
      setActionModal(prev => ({ ...prev, isLoading: false }));
      showToast(err.message || `Failed to execute ${type} operation`, true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading delivery order details...</p>
        </div>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Delivery Order Not Found</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{error || 'The requested delivery order does not exist.'}</p>
          <Link
            to="/deliveries"
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Deliveries
          </Link>
        </main>
      </div>
    );
  }

  const isDraft = delivery.status === 'DRAFT';
  const isPicked = delivery.status === 'PICKED';
  const isPacked = delivery.status === 'PACKED';
  const isValidated = delivery.status === 'VALIDATED';
  const isCancelled = delivery.status === 'CANCELLED';

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
            <p className="text-sm font-semibold">{toastMessage.message}</p>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              to="/deliveries"
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Delivery Orders
            </Link>
            <div className="flex items-center space-x-3 mt-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {delivery.deliveryNumber}
              </h1>
              <StatusBadge status={delivery.status} size="lg" />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Customer: <span className="font-semibold text-slate-800">{delivery.customerName}</span>
            </p>
          </div>

          {/* Contextual Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Step 1: PICK ACTION (Only when DRAFT) */}
            {isDraft && (
              <button
                onClick={() => setActionModal({ isOpen: true, type: 'pick', isLoading: false })}
                className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 shadow-sm shadow-sky-600/20 transition-colors"
              >
                <Layers className="w-4 h-4 mr-2" />
                Pick Products
              </button>
            )}

            {/* Step 2: PACK ACTION (Only when PICKED) */}
            {isPicked && (
              <button
                onClick={() => setActionModal({ isOpen: true, type: 'pack', isLoading: false })}
                className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-sm shadow-amber-600/20 transition-colors"
              >
                <Box className="w-4 h-4 mr-2" />
                Pack Items
              </button>
            )}

            {/* Step 3: VALIDATE ACTION (Only when PACKED) */}
            {isPacked && (
              <button
                onClick={() => setActionModal({ isOpen: true, type: 'validate', isLoading: false })}
                className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all ring-2 ring-emerald-400/50 animate-pulse hover:animate-none"
              >
                <CheckCircle2 className="w-5 h-5 mr-2 stroke-[2.5]" />
                Validate Delivery (Dispatches Stock)
              </button>
            )}

            {/* Validated Indicator */}
            {isValidated && (
              <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                Stock Dispatched & Validated
              </span>
            )}

            {/* Cancel Order Action */}
            {!isValidated && !isCancelled && (
              <button
                onClick={() => setActionModal({ isOpen: true, type: 'cancel', isLoading: false })}
                className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Cancel Order
              </button>
            )}

            <button
              onClick={() => window.print()}
              title="Print Delivery Order"
              className="p-2 rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workflow Progress Tracker */}
        <WorkflowProgressBar currentStatus={delivery.status} />

        {/* Informational Alerts */}
        {isValidated ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-3 text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Delivery Validated — Stock Has Decreased</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Physical inventory for each item below was automatically deducted from the warehouse. A ledger transaction was recorded with reference <strong>{delivery.deliveryNumber}</strong>.
              </p>
            </div>
          </div>
        ) : isCancelled ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start space-x-3 text-rose-900">
            <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Order Cancelled</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                This delivery order has been cancelled. No changes have been made to warehouse stock balances.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start space-x-3 text-indigo-950">
            <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Inventory Reservation Policy</h4>
              <p className="text-xs text-indigo-800 mt-0.5">
                Creating, picking, and packing delivery orders validates item availability but will <strong>NOT</strong> deduct stock. Stock decreases <strong>strictly upon final Validation</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Order Details Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</span>
            <p className="text-base font-bold text-slate-900 mt-1 truncate">{delivery.customerName}</p>
            <p className="text-xs text-slate-400 mt-0.5">Destination entity</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Units</span>
            <p className="text-base font-bold text-slate-900 mt-1">
              {delivery.totalQuantity ?? 0} <span className="text-xs font-normal text-slate-500">units</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{delivery.totalItems ?? delivery.items?.length ?? 0} distinct line items</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Creation Date</span>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {delivery.createdAt
                ? new Date(delivery.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })
                : '—'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Order initiated</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Updated</span>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {delivery.updatedAt
                ? new Date(delivery.updatedAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })
                : '—'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Latest workflow transition</p>
          </div>
        </div>

        {/* Delivery Items Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Delivery Line Items ({delivery.items?.length || 0})
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Total Order Value: <strong className="text-slate-900">${Number(delivery.totalAmount || 0).toFixed(2)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6">SKU</th>
                  <th className="py-3.5 px-6 text-center">Unit of Measure</th>
                  <th className="py-3.5 px-6 text-center">Quantity to Deliver</th>
                  <th className="py-3.5 px-6 text-center">Current Warehouse Stock</th>
                  <th className="py-3.5 px-6 text-center">Stock Availability</th>
                  <th className="py-3.5 px-6 text-right">Unit Price</th>
                  <th className="py-3.5 px-6 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {delivery.items && delivery.items.map((item) => {
                  const hasStock = item.currentStock >= item.quantity;

                  return (
                    <tr key={item.id || item.productId} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {item.productName}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">
                        {item.productSku}
                      </td>
                      <td className="py-4 px-6 text-center text-xs text-slate-600">
                        {item.unitOfMeasure || 'Units'}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-indigo-600">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-6 text-center text-xs font-semibold text-slate-800">
                        {item.currentStock} {item.unitOfMeasure || 'Units'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {isValidated ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Dispatched
                          </span>
                        ) : hasStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Sufficient Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low / Insufficient
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-600">
                        ${Number(item.salesPrice || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        ${Number(item.subtotal || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Movement Ledger Audit Section (Visible when VALIDATED) */}
        {isValidated && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Stock Movement Ledger Trail
              </h3>
              <span className="text-xs text-slate-500 font-mono">Reference: {delivery.deliveryNumber}</span>
            </div>

            {ledgerEntries.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No ledger records found for this delivery.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-6">Product</th>
                      <th className="py-3 px-6">SKU</th>
                      <th className="py-3 px-6 text-center">Movement</th>
                      <th className="py-3 px-6 text-center">Quantity Change</th>
                      <th className="py-3 px-6 text-center">Previous Stock</th>
                      <th className="py-3 px-6 text-center">New Stock</th>
                      <th className="py-3 px-6">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledgerEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-6 font-semibold text-slate-800">
                          {entry.productName}
                        </td>
                        <td className="py-3 px-6 font-mono text-xs text-slate-500">
                          {entry.productSku}
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">
                            {entry.movementType}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-center font-bold text-rose-600">
                          {entry.quantityChange}
                        </td>
                        <td className="py-3 px-6 text-center text-slate-600 font-mono">
                          {entry.previousStock}
                        </td>
                        <td className="py-3 px-6 text-center font-bold text-emerald-700 font-mono">
                          {entry.newStock}
                        </td>
                        <td className="py-3 px-6 text-xs text-slate-500 whitespace-nowrap">
                          {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={actionModal.isOpen}
        isLoading={actionModal.isLoading}
        type={
          actionModal.type === 'validate'
            ? 'success'
            : actionModal.type === 'cancel'
            ? 'danger'
            : actionModal.type === 'pack'
            ? 'warning'
            : 'info'
        }
        title={
          actionModal.type === 'pick'
            ? 'Confirm Picking Operation'
            : actionModal.type === 'pack'
            ? 'Confirm Packaging Operation'
            : actionModal.type === 'validate'
            ? 'Confirm Validation & Stock Dispatch'
            : 'Cancel Delivery Order'
        }
        message={
          actionModal.type === 'pick'
            ? `Pick all items for ${delivery.deliveryNumber}? This verifies that all ordered items exist and are available in required quantities. Stock will NOT decrease until final validation.`
            : actionModal.type === 'pack'
            ? `Pack items for ${delivery.deliveryNumber}? This certifies items are boxed, labeled, and prepared for shipping. Stock will NOT decrease until final validation.`
            : actionModal.type === 'validate'
            ? `Validate ${delivery.deliveryNumber} for dispatch? This is the final step: product stock in the warehouse will be reduced immediately by the delivery quantity, and a permanent movement entry will be added to the Stock Ledger.`
            : `Are you sure you want to cancel delivery order ${delivery.deliveryNumber}? This action cannot be undone.`
        }
        confirmText={
          actionModal.type === 'pick'
            ? 'Confirm Pick'
            : actionModal.type === 'pack'
            ? 'Confirm Pack'
            : actionModal.type === 'validate'
            ? 'Validate & Deduct Stock'
            : 'Cancel Order'
        }
        onConfirm={handleExecuteWorkflowAction}
        onCancel={() => setActionModal({ isOpen: false, type: 'pick', isLoading: false })}
      />
    </div>
  );
}
