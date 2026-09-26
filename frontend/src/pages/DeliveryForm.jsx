import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import deliveryService from '../services/deliveryService';
import warehouseService from '../services/warehouseService';
import locationService from '../services/locationService';
import productService from '../services/productService';
import {
  Truck,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function DeliveryForm() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerReference, setCustomerReference] = useState('');
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [sourceLocationId, setSourceLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    setLoading(true);
    try {
      const [whData, locData, prodData] = await Promise.all([
        warehouseService.getAll(),
        locationService.getAll(),
        productService.getAll()
      ]);

      setWarehouses(whData);
      if (whData.length > 0) {
        const firstWhId = whData[0].id;
        setSourceWarehouseId(firstWhId.toString());
        const locs = locData.filter((l) => l.warehouse?.id === firstWhId);
        setFilteredLocations(locs);
        if (locs.length > 0) setSourceLocationId(locs[0].id.toString());
      }

      setLocations(locData);
      setProducts(prodData);

      if (prodData.length > 0) {
        setItems([
          {
            productId: prodData[0].id,
            quantity: 1
          }
        ]);
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize delivery form data');
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseChange = (whId) => {
    setSourceWarehouseId(whId);
    const locs = locations.filter((l) => l.warehouse?.id === parseInt(whId, 10));
    setFilteredLocations(locs);
    if (locs.length > 0) {
      setSourceLocationId(locs[0].id.toString());
    } else {
      setSourceLocationId('');
    }
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([
      ...items,
      {
        productId: products[0].id,
        quantity: 1
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    if (field === 'productId') {
      updated[index].productId = parseInt(value, 10);
    } else if (field === 'quantity') {
      updated[index].quantity = Math.max(1, parseInt(value, 10) || 1);
    }
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }
    if (!sourceWarehouseId) {
      setError('Please select a source warehouse');
      return;
    }
    if (!sourceLocationId) {
      setError('Please select a source rack location');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one line item to the delivery order');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      customerName,
      customerReference,
      sourceWarehouseId: parseInt(sourceWarehouseId, 10),
      sourceLocationId: parseInt(sourceLocationId, 10),
      notes,
      items: items.map((i) => ({
        productId: parseInt(i.productId, 10),
        quantity: parseInt(i.quantity, 10)
      }))
    };

    try {
      const created = await deliveryService.create(payload);
      navigate(`/deliveries/${created.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create delivery order');
      setIsSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="New Delivery Order">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-3">
            <Link
              to="/deliveries"
              className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <span>Create Delivery Order</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Draft a new customer shipment order for Pick → Pack → Validate processing.
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
            <span>Loading delivery form data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Details Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Delivery Order Header</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">Customer Reference / PO #</label>
                  <input
                    type="text"
                    value={customerReference}
                    onChange={(e) => setCustomerReference(e.target.value)}
                    placeholder="e.g. CUST-PO-2026-88"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">Source Warehouse *</label>
                  <select
                    required
                    value={sourceWarehouseId}
                    onChange={(e) => handleWarehouseChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">Source Rack Location *</label>
                  <select
                    required
                    value={sourceLocationId}
                    onChange={(e) => setSourceLocationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {filteredLocations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">Notes / Instructions</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Fragile shipment, handle with care"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Line Items Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Delivery Products</h3>
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
                      <th className="py-3 px-4 w-40">Available Stock</th>
                      <th className="py-3 px-4 w-36">Quantity</th>
                      <th className="py-3 px-4 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {items.map((item, idx) => {
                      const selectedProd = products.find((p) => p.id === item.productId);
                      const availableQty = selectedProd ? selectedProd.quantityOnHand : 0;
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
                            <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                              {availableQty} units
                            </span>
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
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end space-x-3">
              <Link
                to="/deliveries"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20"
              >
                {isSubmitting ? 'Creating Draft...' : 'Save Draft Delivery Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
