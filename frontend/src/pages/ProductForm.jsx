import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import productService from '../services/productService';
import {
  Boxes,
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    categoryId: '',
    unitOfMeasure: 'Units',
    costPrice: '0.00',
    salesPrice: '0.00',
    quantityOnHand: '0',
    reorderPoint: '10'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
    if (isEditMode) {
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const cats = await productService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const p = await productService.getProduct(id);
      setFormData({
        name: p.name || '',
        sku: p.sku || '',
        barcode: p.barcode || '',
        description: p.description || '',
        categoryId: p.category ? p.category.id.toString() : '',
        unitOfMeasure: p.unitOfMeasure || 'Units',
        costPrice: p.costPrice != null ? p.costPrice.toString() : '0.00',
        salesPrice: p.salesPrice != null ? p.salesPrice.toString() : '0.00',
        quantityOnHand: p.quantityOnHand != null ? p.quantityOnHand.toString() : '0',
        reorderPoint: p.reorderPoint != null ? p.reorderPoint.toString() : '10'
      });
    } catch (err) {
      setServerError(err.message || 'Failed to load product for editing');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU / Product Code is required';
    }

    if (!formData.unitOfMeasure) {
      newErrors.unitOfMeasure = 'Unit of measure is required';
    }

    const qty = parseInt(formData.quantityOnHand, 10);
    if (isNaN(qty) || qty < 0) {
      newErrors.quantityOnHand = 'Stock quantity cannot be negative';
    }

    const reorder = parseInt(formData.reorderPoint, 10);
    if (isNaN(reorder) || reorder < 0) {
      newErrors.reorderPoint = 'Reorder threshold cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      barcode: formData.barcode ? formData.barcode.trim() : null,
      description: formData.description,
      categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
      unitOfMeasure: formData.unitOfMeasure,
      costPrice: parseFloat(formData.costPrice) || 0,
      salesPrice: parseFloat(formData.salesPrice) || 0,
      quantityOnHand: parseInt(formData.quantityOnHand, 10) || 0,
      reorderPoint: parseInt(formData.reorderPoint, 10) || 0
    };

    try {
      if (isEditMode) {
        await productService.updateProduct(id, payload);
        navigate(`/products/${id}`);
      } else {
        await productService.createProduct(payload);
        navigate('/products');
      }
    } catch (err) {
      setServerError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle={isEditMode ? 'Edit Product' : 'Add New Product'}>
        <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <span>Loading product data...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={isEditMode ? 'Edit Product' : 'Add New Product'}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {isEditMode ? 'Update Product Information' : 'Product Registration Form'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter product identification, category, unit of measure, pricing, and initial inventory stock levels.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="name" className="block text-xs font-semibold uppercase text-slate-700">
                  Product Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Enterprise 2D Barcode Scanner"
                  className={`w-full px-4 py-3 bg-slate-50/50 border ${
                    errors.name ? 'border-red-300' : 'border-slate-200'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* SKU */}
              <div className="space-y-1.5">
                <label htmlFor="sku" className="block text-xs font-semibold uppercase text-slate-700">
                  SKU / Code *
                </label>
                <input
                  id="sku"
                  name="sku"
                  type="text"
                  required
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. SCN-2D-001"
                  className={`w-full px-4 py-3 bg-slate-50/50 border ${
                    errors.sku ? 'border-red-300' : 'border-slate-200'
                  } rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                />
                {errors.sku && <p className="text-xs text-red-600">{errors.sku}</p>}
              </div>

              {/* Barcode */}
              <div className="space-y-1.5">
                <label htmlFor="barcode" className="block text-xs font-semibold uppercase text-slate-700">
                  Barcode (Optional)
                </label>
                <input
                  id="barcode"
                  name="barcode"
                  type="text"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder="e.g. 890123456701"
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label htmlFor="categoryId" className="block text-xs font-semibold uppercase text-slate-700">
                  Category
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">Unassigned Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit of Measure */}
              <div className="space-y-1.5">
                <label htmlFor="unitOfMeasure" className="block text-xs font-semibold uppercase text-slate-700">
                  Unit of Measure *
                </label>
                <select
                  id="unitOfMeasure"
                  name="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="Units">Units</option>
                  <option value="Boxes">Boxes</option>
                  <option value="Rolls">Rolls</option>
                  <option value="Kg">Kg</option>
                  <option value="Liters">Liters</option>
                </select>
                {errors.unitOfMeasure && <p className="text-xs text-red-600">{errors.unitOfMeasure}</p>}
              </div>

              {/* Initial / Current Stock */}
              <div className="space-y-1.5">
                <label htmlFor="quantityOnHand" className="block text-xs font-semibold uppercase text-slate-700">
                  {isEditMode ? 'Current Stock Quantity *' : 'Initial Stock Quantity *'}
                </label>
                <input
                  id="quantityOnHand"
                  name="quantityOnHand"
                  type="number"
                  min="0"
                  required
                  value={formData.quantityOnHand}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-50/50 border ${
                    errors.quantityOnHand ? 'border-red-300' : 'border-slate-200'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                />
                {errors.quantityOnHand && <p className="text-xs text-red-600">{errors.quantityOnHand}</p>}
              </div>

              {/* Reorder Point */}
              <div className="space-y-1.5">
                <label htmlFor="reorderPoint" className="block text-xs font-semibold uppercase text-slate-700">
                  Reorder Warning Threshold *
                </label>
                <input
                  id="reorderPoint"
                  name="reorderPoint"
                  type="number"
                  min="0"
                  required
                  value={formData.reorderPoint}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-50/50 border ${
                    errors.reorderPoint ? 'border-red-300' : 'border-slate-200'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                />
                {errors.reorderPoint && <p className="text-xs text-red-600">{errors.reorderPoint}</p>}
              </div>

              {/* Cost Price */}
              <div className="space-y-1.5">
                <label htmlFor="costPrice" className="block text-xs font-semibold uppercase text-slate-700">
                  Cost Price ($)
                </label>
                <input
                  id="costPrice"
                  name="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Sales Price */}
              <div className="space-y-1.5">
                <label htmlFor="salesPrice" className="block text-xs font-semibold uppercase text-slate-700">
                  Sales Price ($)
                </label>
                <input
                  id="salesPrice"
                  name="salesPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salesPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="description" className="block text-xs font-semibold uppercase text-slate-700">
                  Description / Specification
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Additional product information or specifications..."
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                ></textarea>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
              <Link
                to="/products"
                className="px-5 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditMode ? 'Save Changes' : 'Create Product'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
