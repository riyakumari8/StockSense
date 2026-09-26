import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import productService from '../services/productService';
import deliveryService from '../services/deliveryService';
import {
  Truck,
  Plus,
  Trash2,
  ArrowLeft,
  Package,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Save,
  DollarSign
} from 'lucide-react';

export default function CreateDelivery() {
  const navigate = useNavigate();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // New item draft inputs
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await productService.getAllProducts();
      setProducts(data);
      if (data.length > 0) {
        setSelectedProductId(data[0].id.toString());
      }
    } catch (err) {
      setFormError('Failed to load available products. Please ensure the backend is running.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedProductId) {
      setFormError('Please select a product.');
      return;
    }

    const qty = parseInt(itemQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setFormError('Quantity must be a positive integer greater than zero.');
      return;
    }

    const product = products.find(p => p.id.toString() === selectedProductId.toString());
    if (!product) {
      setFormError('Selected product not found.');
      return;
    }

    // Check if product is already added; if so, increase quantity
    const existingIndex = selectedItems.findIndex(i => i.productId === product.id);
    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += qty;
      setSelectedItems(updated);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitOfMeasure: product.unitOfMeasure,
          salesPrice: product.salesPrice || 0,
          quantityOnHand: product.quantityOnHand ?? 0,
          quantity: qty
        }
      ]);
    }

    // Reset quantity input to 1
    setItemQuantity(1);
  };

  const handleRemoveItem = (index) => {
    const updated = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updated);
  };

  const handleUpdateItemQuantity = (index, newQty) => {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty <= 0) return;
    const updated = [...selectedItems];
    updated[index].quantity = qty;
    setSelectedItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError('Customer name is required.');
      return;
    }

    if (selectedItems.length === 0) {
      setFormError('Please add at least one product item to this delivery order.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        customerName: customerName.trim(),
        items: selectedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const createdDelivery = await deliveryService.createDelivery(payload);
      setSuccessToast(`Delivery Order ${createdDelivery.deliveryNumber} successfully created in DRAFT status!`);
      setTimeout(() => {
        navigate(`/deliveries/${createdDelivery.id}`);
      }, 1200);
    } catch (err) {
      setFormError(err.message || 'Failed to create delivery order.');
      setIsSubmitting(false);
    }
  };

  const totalQuantity = selectedItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const estimatedTotal = selectedItems.reduce((acc, curr) => acc + (curr.salesPrice * curr.quantity), 0);
  const currentSelectedProduct = products.find(p => p.id.toString() === selectedProductId.toString());

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Floating Success Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 duration-200">
          <div className="p-4 rounded-xl shadow-xl flex items-center space-x-3 bg-emerald-50 border border-emerald-200 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-semibold">{successToast}</p>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb / Back Link */}
        <div>
          <Link
            to="/deliveries"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Delivery Orders
          </Link>
          <div className="mt-2 flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Truck className="w-7 h-7 text-indigo-600" />
              Create Delivery Order
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Initial Status: DRAFT
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Specify the customer and select the products to be dispatched. Stock is reserved and will only decrease upon final validation.
          </p>
        </div>

        {/* Global Error Banner */}
        {formError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center space-x-3 text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p className="text-sm font-medium">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Customer Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">1</span>
              Customer Details
            </h3>

            <div>
              <label htmlFor="customerName" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Customer Name / Destination <span className="text-rose-500">*</span>
              </label>
              <input
                id="customerName"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Acme Industrial Logistics, Global Tech Hub, etc."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all placeholder-slate-400"
              />
            </div>
          </div>

          {/* Section 2: Add Products Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">2</span>
                Select Products & Quantities
              </h3>
              {currentSelectedProduct && (
                <span className="text-xs text-slate-500">
                  Current Warehouse Stock: <strong className={currentSelectedProduct.quantityOnHand <= 5 ? 'text-amber-600' : 'text-emerald-600'}>{currentSelectedProduct.quantityOnHand} {currentSelectedProduct.unitOfMeasure}</strong>
                </span>
              )}
            </div>

            {loadingProducts ? (
              <p className="text-sm text-slate-400">Loading product catalog...</p>
            ) : products.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                No products found in catalog. Please ensure products are initialized in database.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-4 bg-slate-50 rounded-xl border border-slate-100">
                {/* Product Dropdown */}
                <div className="sm:col-span-7">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Select Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} ({prod.sku}) — Stock: {prod.quantityOnHand} {prod.unitOfMeasure}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity Input */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Add Item Button */}
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Selected Items Table Review */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Order Review ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'})
              </h4>

              {selectedItems.length === 0 ? (
                <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
                  <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  No items added yet. Select a product and quantity above and click "Add".
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-4">Product</th>
                        <th className="py-2.5 px-4">SKU</th>
                        <th className="py-2.5 px-4 text-center">Available</th>
                        <th className="py-2.5 px-4 text-center">Quantity</th>
                        <th className="py-2.5 px-4 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-right">Subtotal</th>
                        <th className="py-2.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedItems.map((item, index) => {
                        const itemSubtotal = item.salesPrice * item.quantity;
                        const hasInsufficientStock = item.quantityOnHand < item.quantity;

                        return (
                          <tr key={item.productId} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              {item.productName}
                              {hasInsufficientStock && (
                                <p className="text-[11px] text-amber-600 font-normal">
                                  ⚠️ Exceeds on-hand stock ({item.quantityOnHand} available)
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-xs text-slate-500">
                              {item.sku}
                            </td>
                            <td className="py-3 px-4 text-center text-xs text-slate-600">
                              {item.quantityOnHand} {item.unitOfMeasure}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItemQuantity(index, e.target.value)}
                                className="w-16 px-2 py-1 border border-slate-200 rounded text-center text-sm font-semibold"
                              />
                            </td>
                            <td className="py-3 px-4 text-right text-slate-600">
                              ${Number(item.salesPrice).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-slate-900">
                              ${itemSubtotal.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                title="Remove item"
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
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
              )}
            </div>

            {/* Order Totals Summary */}
            {selectedItems.length > 0 && (
              <div className="flex justify-end pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-full sm:w-72 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Distinct Products:</span>
                    <span className="font-bold">{selectedItems.length}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Total Quantity:</span>
                    <span className="font-bold">{totalQuantity} units</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Estimated Total:</span>
                    <span className="text-indigo-600">${estimatedTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-2">
            <Link
              to="/deliveries"
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || selectedItems.length === 0}
              className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Saving Order...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Delivery Order (Draft)
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
