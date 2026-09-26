import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import receiptService from '../services/receiptService';
import supplierService from '../services/supplierService';
import warehouseService from '../services/warehouseService';
import locationService from '../services/locationService';
import productService from '../services/productService';
import {
  PackageCheck,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function ReceiptForm() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    setLoading(true);
    try {
      const [supData, whData, locData, prodData] = await Promise.all([
        supplierService.getAll(),
        warehouseService.getAll(),
        locationService.getAll(),
        productService.getAll()
      ]);

      const activeSuppliers = supData.filter((s) => s.active !== false);
      setSuppliers(activeSuppliers);
      if (activeSuppliers.length > 0) setSupplierId(activeSuppliers[0].id.toString());

      setWarehouses(whData);
      if (whData.length > 0) {
        const firstWhId = whData[0].id;
        setWarehouseId(firstWhId.toString());
        const locs = locData.filter((l) => l.warehouse?.id === firstWhId);
        setFilteredLocations(locs);
        if (locs.length > 0) setDestinationLocationId(locs[0].id.toString());
      }
      setLocations(locData);
      setProducts(prodData);

      // Add default initial item line if products exist
      if (prodData.length > 0) {
        setItems([
          {
            productId: prodData[0].id,
            quantity: 1,
            unitCost: prodData[0].costPrice || 0
          }
        ]);
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize form dropdowns');
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseChange = (whId) => {
    setWarehouseId(whId);
    const locs = locations.filter((l) => l.warehouse?.id === parseInt(whId, 10));
    setFilteredLocations(locs);
    if (locs.length > 0) {
      setDestinationLocationId(locs[0].id.toString());
    } else {
      setDestinationLocationId('');
    }
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        productId: defaultProd.id,
        quantity: 1,
        unitCost: defaultProd.costPrice || 0
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    if (field === 'productId') {
      const prodId = parseInt(value, 10);
      const prod = products.find((p) => p.id === prodId);
      updated[index].productId = prodId;
      if (prod) {
        updated[index].unitCost = prod.costPrice || 0;
      }
    } else if (field === 'quantity') {
      updated[index].quantity = Math.max(1, parseInt(value, 10) || 1);
    } else if (field === 'unitCost') {
      updated[index].unitCost = Math.max(0, parseFloat(value) || 0);
    }
    setItems(updated);
  };

  const calculateGrandTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!supplierId) {
      setError('Please select a supplier');
      return;
    }
    if (!warehouseId) {
      setError('Please select a warehouse');
      return;
    }
    if (!destinationLocationId) {
      setError('Please select a destination rack location');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one line item to the receipt');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      supplierId: parseInt(supplierId, 10),
      warehouseId: parseInt(warehouseId, 10),
      destinationLocationId: parseInt(destinationLocationId, 10),
      reference,
      notes,
      items: items.map((i) => ({
        productId: parseInt(i.productId, 10),
        quantity: parseInt(i.quantity, 10),
        unitCost: parseFloat(i.unitCost)
      }))
    };

    try {
      const created = await receiptService.create(payload);
      navigate(`/receipts/${created.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create stock receipt');
      setIsSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="New Stock Receipt">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-3">
            <Link
              to="/receipts"
              className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <PackageCheck className="w-5 h-5 text-indigo-600" />
                <span>Create Stock Receipt</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Draft a new incoming shipment order from a vendor supplier.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-500 flex items-center justify-center space-x-2">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            <span>Loading receipt form data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Details Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Receipt Header Info</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">Supplier / Vendor *</label>
                  <select
                    required
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">Receiving Warehouse *</label>
                  <select
                    required
                    value={warehouseId}
                    onChange={(e) => handleWarehouseChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">Destination Rack Location *</label>
                  <select
                    required
                    value={destinationLocationId}
                    onChange={(e) => setDestinationLocationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {filteredLocations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">External Reference / PO #</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. PO-2026-9482"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">Notes / Comments</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Received via Freight Logistics Cargo"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Receipt Line Items Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Line Items</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4 w-32">Quantity</th>
                      <th className="py-3 px-4 w-36">Unit Cost ($)</th>
                      <th className="py-3 px-4 w-36 text-right">Subtotal ($)</th>
                      <th className="py-3 px-4 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {items.map((item, idx) => {
                      const subtotal = item.quantity * item.unitCost;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <select
                              value={item.productId}
                              onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                              ))}
                            </select>
                          </td>

                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                            />
                          </td>

                          <td className="py-3 px-4">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitCost}
                              onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                            />
                          </td>

                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg inline-block"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Bar */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-64 space-y-1 text-right">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Total Receipt Value</div>
                  <div className="text-xl font-bold text-indigo-600">
                    ${calculateGrandTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end space-x-3">
              <Link
                to="/receipts"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20"
              >
                {isSubmitting ? 'Saving Draft...' : 'Save Draft Receipt'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
