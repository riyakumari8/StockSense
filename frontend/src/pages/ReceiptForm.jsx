import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import receiptService from '../services/receiptService';
import supplierService from '../services/supplierService';
import productService from '../services/productService';
import {
  FileText,
  Plus,
  Trash2,
  ArrowLeft,
  Building2,
  Package,
  Layers,
  DollarSign,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Boxes
} from 'lucide-react';

export default function ReceiptForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [supplierId, setSupplierId] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { productId: '', quantity: 1, unitPrice: '' }
  ]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchFormData();
  }, [id]);

  const fetchFormData = async () => {
    setLoading(true);
    try {
      const [suppliersData, productsData] = await Promise.all([
        supplierService.getAll(),
        productService.getAll()
      ]);
      setSuppliers(suppliersData);
      setProducts(productsData);

      if (isEditing) {
        const receiptData = await receiptService.getById(id);
        if (receiptData.status !== 'DRAFT') {
          alert('Only DRAFT receipts can be edited.');
          navigate(`/receipts/${id}`);
          return;
        }
        setSupplierId(receiptData.supplier?.id || '');
        setReceiptNumber(receiptData.receiptNumber || '');
        setNotes(receiptData.notes || '');
        if (receiptData.items && receiptData.items.length > 0) {
          setItems(receiptData.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice || ''
          })));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: '' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      alert('A receipt must have at least one product item.');
      return;
    }
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // If product changed, automatically fill unitPrice from product costPrice
    if (field === 'productId') {
      const selectedProduct = products.find(p => p.id === Number(value));
      if (selectedProduct) {
        updated[index].unitPrice = selectedProduct.costPrice || '';
      }
    }

    setItems(updated);
  };

  const validate = () => {
    const errors = {};
    if (!supplierId) {
      errors.supplierId = 'Please select a supplier';
    }
    if (!items || items.length === 0) {
      errors.items = 'Please add at least one product item';
    } else {
      const itemErrors = [];
      items.forEach((item, idx) => {
        if (!item.productId) {
          itemErrors.push(`Item #${idx + 1}: Product is required`);
        }
        if (!item.quantity || parseInt(item.quantity, 10) <= 0) {
          itemErrors.push(`Item #${idx + 1}: Quantity must be greater than 0`);
        }
      });
      if (itemErrors.length > 0) {
        errors.items = itemErrors[0];
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError('');

    const payload = {
      supplierId: Number(supplierId),
      receiptNumber: receiptNumber.trim() || null,
      notes: notes.trim() || null,
      items: items.map(item => ({
        productId: Number(item.productId),
        quantity: parseInt(item.quantity, 10),
        unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : null
      }))
    };

    try {
      if (isEditing) {
        await receiptService.update(id, payload);
        navigate(`/receipts/${id}`);
      } else {
        const created = await receiptService.create(payload);
        navigate(`/receipts/${created.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save receipt');
      setSubmitting(false);
    }
  };

  // Calculations
  const totalUnits = items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
  const totalEstimatedCost = items.reduce((sum, item) => {
    const qty = parseInt(item.quantity, 10) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + (qty * price);
  }, 0);

  const selectedSupplierObj = suppliers.find(s => s.id === Number(supplierId));

  return (
    <Layout pageTitle={isEditing ? 'Edit Draft Receipt' : 'New Stock Receipt'}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <div>
          <Link
            to="/receipts"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Receipts</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center space-x-2 shadow-sm animate-in fade-in duration-200">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Receipt Details</h3>
                <p className="text-xs text-slate-500">
                  Specify the procurement vendor and general receipt information.
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Created in DRAFT State
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Vendor / Supplier <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                      formErrors.supplierId ? 'border-red-400' : 'border-slate-200'
                    } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white`}
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.supplierName} {s.contactPerson ? `(${s.contactPerson})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.supplierId && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.supplierId}</p>
                )}
                {selectedSupplierObj && (
                  <div className="mt-2 p-2.5 bg-indigo-50/50 rounded-xl text-xs text-slate-600 border border-indigo-100/60 flex items-center space-x-2">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>
                      {selectedSupplierObj.address || selectedSupplierObj.phone || selectedSupplierObj.email || 'Supplier verified'}
                    </span>
                  </div>
                )}
              </div>

              {/* Receipt Number (Optional) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Receipt Reference Number
                </label>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="Leave empty to auto-generate (e.g. RCV-0001)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Optional. If blank, system will generate sequential identifier automatically.
                </p>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Delivery / PO Remarks
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Purchase order #PO-8821 via freight truck #5. Inspected by receiving dock."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Product Items Table Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Products & Quantities</h3>
                <p className="text-xs text-slate-500">
                  Add the items and quantities delivered by the supplier.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product Line</span>
              </button>
            </div>

            {formErrors.items && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200">
                {formErrors.items}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3 w-5/12">Product</th>
                    <th className="px-4 py-3 w-2/12">Quantity</th>
                    <th className="px-4 py-3 w-2/12">Unit</th>
                    <th className="px-4 py-3 w-2/12">Unit Price ($)</th>
                    <th className="px-4 py-3 w-1/12 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => {
                    const selectedProd = products.find(p => p.id === Number(item.productId));
                    return (
                      <tr key={index} className="hover:bg-slate-50/50">
                        {/* Product Dropdown */}
                        <td className="px-4 py-3">
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                          >
                            <option value="">-- Choose Product --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                [{p.sku}] {p.name} (Stock: {p.quantityOnHand} {p.unitOfMeasure})
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Quantity */}
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                          />
                        </td>

                        {/* Unit of Measure */}
                        <td className="px-4 py-3">
                          <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-medium">
                            {selectedProd?.unitOfMeasure || '—'}
                          </span>
                        </td>

                        {/* Unit Price */}
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                          />
                        </td>

                        {/* Remove */}
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            disabled={items.length === 1}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
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

            {/* Bottom Summary Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/60 p-4 rounded-xl">
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Total Product Lines:</span>
                  <span className="ml-2 font-bold text-slate-800">{items.length}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Total Units:</span>
                  <span className="ml-2 font-extrabold text-indigo-600">{totalUnits}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Estimated Valuation:</span>
                  <span className="ml-2 font-bold text-slate-800">${totalEstimatedCost.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  to="/receipts"
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-60 transition-all"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isEditing ? 'Save Changes' : 'Create Draft Receipt'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
