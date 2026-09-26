import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import {
  Package,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  PlusCircle,
  MinusCircle,
  Boxes,
  ArrowUpDown
} from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Product Add/Edit Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
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
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Stock Adjustment Modal
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(1);
  const [adjustmentType, setAdjustmentType] = useState('ADD'); // ADD or REMOVE

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prodsData, catsData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ]);
      setProducts(prodsData);
      setCategories(catsData);
    } catch (err) {
      setError(err.message || 'Failed to load products data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    try {
      const data = await productService.getAll(query);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Open Product Modal
  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        name: prod.name || '',
        sku: prod.sku || '',
        barcode: prod.barcode || '',
        description: prod.description || '',
        categoryId: prod.category ? prod.category.id : '',
        unitOfMeasure: prod.unitOfMeasure || 'Units',
        costPrice: prod.costPrice != null ? prod.costPrice.toString() : '0.00',
        salesPrice: prod.salesPrice != null ? prod.salesPrice.toString() : '0.00',
        quantityOnHand: prod.quantityOnHand != null ? prod.quantityOnHand.toString() : '0',
        reorderPoint: prod.reorderPoint != null ? prod.reorderPoint.toString() : '10'
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        unitOfMeasure: 'Units',
        costPrice: '0.00',
        salesPrice: '0.00',
        quantityOnHand: '0',
        reorderPoint: '10'
      });
    }
    setFormErrors({});
    setProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormErrors({ name: 'Product name is required' });
      return;
    }
    if (!formData.sku.trim()) {
      setFormErrors({ sku: 'SKU is required' });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    const payload = {
      ...formData,
      costPrice: parseFloat(formData.costPrice) || 0,
      salesPrice: parseFloat(formData.salesPrice) || 0,
      quantityOnHand: parseInt(formData.quantityOnHand, 10) || 0,
      reorderPoint: parseInt(formData.reorderPoint, 10) || 0,
      categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null
    };

    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
        setSuccessMsg('Product updated successfully!');
      } else {
        await productService.create(payload);
        setSuccessMsg('Product created successfully!');
      }
      setProductModalOpen(false);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setFormErrors({ server: err.message || 'Operation failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stock Adjustment Submit
  const handleStockAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStockProduct) return;

    const amount = parseInt(adjustmentAmount, 10) || 0;
    const finalAdjustment = adjustmentType === 'REMOVE' ? -amount : amount;

    try {
      await productService.updateStock(selectedStockProduct.id, finalAdjustment);
      setSuccessMsg(`Stock for ${selectedStockProduct.name} updated!`);
      setStockModalOpen(false);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Stock adjustment failed');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.delete(id);
      setSuccessMsg('Product deleted successfully');
      fetchInitialData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    if (showLowStockOnly && !p.lowStock) return false;
    if (selectedCategory && p.category?.id !== parseInt(selectedCategory, 10)) return false;
    return true;
  });

  const lowStockCount = products.filter((p) => p.lowStock).length;

  return (
    <Layout pageTitle="Product Catalog & Inventory">
      <div className="space-y-6">
        {/* Low Stock Warning Banner */}
        {lowStockCount > 0 && (
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Low Stock Alert</p>
                <p className="text-xs text-amber-700">
                  <span className="font-bold">{lowStockCount} item{lowStockCount > 1 ? 's are' : ' is'}</span> currently below reorder thresholds.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-amber-300 text-amber-800 hover:bg-amber-100/50 transition-colors shadow-xs"
            >
              {showLowStockOnly ? 'Show All Products' : 'Filter Low Stock Items'}
            </button>
          </div>
        )}

        {/* Action Header & Filter Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Filter Dropdowns & Add Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleOpenProductModal()}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all ml-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <span>Loading inventory products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No products found</p>
              <p className="text-xs text-slate-500">
                {searchQuery || selectedCategory || showLowStockOnly
                  ? 'Try adjusting your search query or category filters.'
                  : 'Start by creating your first inventory product.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">SKU / Item</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Stock Status</th>
                    <th className="py-3.5 px-6">Cost / Sales</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredProducts.map((p) => {
                    const isOutOfStock = p.quantityOnHand === 0;
                    const isLowStock = p.lowStock && !isOutOfStock;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-start space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs flex-shrink-0 mt-0.5">
                              <Boxes className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{p.name}</p>
                              <p className="text-xs font-mono text-indigo-600 font-medium">SKU: {p.sku}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                            {p.category ? p.category.name : 'Unassigned'}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-base font-extrabold text-slate-900">{p.quantityOnHand}</span>
                              <span className="text-xs text-slate-500">{p.unitOfMeasure}</span>
                            </div>
                            {isOutOfStock ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-100 text-red-700">
                                Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800">
                                Low Stock ({p.reorderPoint} min)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                In Stock
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-xs">
                          <p className="font-semibold text-slate-900">${parseFloat(p.salesPrice).toFixed(2)}</p>
                          <p className="text-slate-400">Cost: ${parseFloat(p.costPrice).toFixed(2)}</p>
                        </td>

                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedStockProduct(p);
                              setAdjustmentAmount(1);
                              setAdjustmentType('ADD');
                              setStockModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                            title="Adjust Stock Quantity"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenProductModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Product"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Product"
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
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Inventory Product'}
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.server && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {formErrors.server}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Enterprise 2D Barcode Scanner"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. SCN-2D-001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  {formErrors.sku && <p className="text-xs text-red-600 mt-1">{formErrors.sku}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="e.g. 890123456701"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Unit of Measure
                  </label>
                  <select
                    value={formData.unitOfMeasure}
                    onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="Units">Units</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Rolls">Rolls</option>
                    <option value="Kg">Kg</option>
                    <option value="Liters">Liters</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Sales Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salesPrice}
                    onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Current Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.quantityOnHand}
                    onChange={(e) => setFormData({ ...formData, quantityOnHand: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Reorder Threshold Point
                  </label>
                  <input
                    type="number"
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product specification or notes..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK STOCK ADJUSTMENT MODAL */}
      {stockModalOpen && selectedStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Adjust Stock Quantity</h3>
              <button onClick={() => setStockModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <p className="font-semibold text-slate-900">{selectedStockProduct.name}</p>
              <p className="text-slate-500 mt-0.5">Current Stock: <span className="font-bold text-indigo-600">{selectedStockProduct.quantityOnHand}</span> {selectedStockProduct.unitOfMeasure}</p>
            </div>

            <form onSubmit={handleStockAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('ADD')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 border ${
                      adjustmentType === 'ADD'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Stock</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('REMOVE')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 border ${
                      adjustmentType === 'REMOVE'
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>Reduce Stock</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
