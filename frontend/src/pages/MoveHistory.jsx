import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ledgerService from '../services/ledgerService';
import productService from '../services/productService';
import locationService from '../services/locationService';
import {
  History,
  Filter,
  Loader2,
  AlertCircle,
  ArrowRightLeft,
  Sliders,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Calendar
} from 'lucide-react';

export default function MoveHistory() {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedMovementType, setSelectedMovementType] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [historyData, prodData, locData] = await Promise.all([
        ledgerService.getMoveHistory(),
        productService.getAll(),
        locationService.getAll()
      ]);
      setLedgerEntries(historyData);
      setProducts(prodData);
      setLocations(locData);
    } catch (err) {
      setError(err.message || 'Failed to load stock move history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (prodId = selectedProduct, locId = selectedLocation, moveType = selectedMovementType) => {
    setSelectedProduct(prodId);
    setSelectedLocation(locId);
    setSelectedMovementType(moveType);

    setLoading(true);
    try {
      const data = await ledgerService.getMoveHistory(prodId, locId, moveType);
      setLedgerEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout pageTitle="Stock Ledger & Move History">
      <div className="space-y-6">
        {/* Header & Filter Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <History className="w-5 h-5 text-indigo-600" />
              <span>Stock Move History Ledger</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Audit log of all stock movements (Transfers, Adjustments, Receipts, and Deliveries) across locations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedProduct}
                onChange={(e) => handleFilterChange(e.target.value, selectedLocation, selectedMovementType)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="">All Products</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedLocation}
                onChange={(e) => handleFilterChange(selectedProduct, e.target.value, selectedMovementType)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="">All Locations</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.warehouse?.code})</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedMovementType}
                onChange={(e) => handleFilterChange(selectedProduct, selectedLocation, e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="">All Movement Types</option>
                <option value="TRANSFER">Internal Transfer</option>
                <option value="ADJUSTMENT">Stock Adjustment</option>
                <option value="RECEIPT">Receipt</option>
                <option value="DELIVERY">Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <span>Loading ledger move history...</span>
            </div>
          ) : ledgerEntries.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No stock move history recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3.5 px-6">Date & Time</th>
                    <th className="py-3.5 px-6">Product</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Movement Type</th>
                    <th className="py-3.5 px-6">Qty Change</th>
                    <th className="py-3.5 px-6">Before $\rightarrow$ After</th>
                    <th className="py-3.5 px-6">Performed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {ledgerEntries.map((l) => {
                    const isPositive = l.quantity > 0;
                    const isZero = l.quantity === 0;

                    return (
                      <tr key={l.id} className="hover:bg-slate-50/60">
                        <td className="py-4 px-6 font-mono text-slate-500">
                          {l.createdAt ? new Date(l.createdAt).toLocaleString() : 'N/A'}
                        </td>

                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {l.product?.name} <span className="font-mono text-indigo-600 font-normal">({l.product?.sku})</span>
                        </td>

                        <td className="py-4 px-6 text-slate-700">
                          <span className="font-semibold">{l.location?.name}</span>
                          <span className="font-mono text-slate-400 ml-1">({l.location?.warehouse?.code})</span>
                        </td>

                        <td className="py-4 px-6">
                          {l.movementType === 'TRANSFER' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800">
                              <ArrowRightLeft className="w-3 h-3 mr-1 text-indigo-600" /> TRANSFER
                            </span>
                          ) : l.movementType === 'ADJUSTMENT' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                              <Sliders className="w-3 h-3 mr-1 text-amber-600" /> ADJUSTMENT
                            </span>
                          ) : l.movementType === 'RECEIPT' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                              <ArrowDownLeft className="w-3 h-3 mr-1 text-emerald-600" /> RECEIPT
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                              <ArrowUpRight className="w-3 h-3 mr-1 text-blue-600" /> DELIVERY
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 font-extrabold">
                          <span className={isZero ? 'text-slate-500' : isPositive ? 'text-emerald-600' : 'text-red-600'}>
                            {isPositive ? `+${l.quantity}` : l.quantity} {l.product?.unitOfMeasure}
                          </span>
                        </td>

                        <td className="py-4 px-6 font-mono text-slate-600">
                          {l.quantityBefore} $\rightarrow$ <span className="font-bold text-slate-900">{l.quantityAfter}</span>
                        </td>

                        <td className="py-4 px-6 text-slate-600">
                          <span className="flex items-center space-x-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{l.performedBy || 'System'}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
