import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import productService from '../services/productService';
import {
  Boxes,
  ArrowLeft,
  Pencil,
  Trash2,
  Package,
  FolderTree,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  Tag,
  Loader2,
  ShieldAlert
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await productService.getProduct(id);
      setProduct(data);
    } catch (err) {
      setError(err.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete product "${product.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await productService.deleteProduct(id);
      navigate('/products');
    } catch (err) {
      alert(err.message || 'Failed to delete product');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Product Details">
        <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <span>Loading product details...</span>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout pageTitle="Product Details">
        <div className="bg-white rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto border border-slate-200">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Product Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'The requested product could not be retrieved.'}</p>
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>
      </Layout>
    );
  }

  const isOutOfStock = product.quantityOnHand === 0;
  const isLowStock = product.lowStock && !isOutOfStock;

  return (
    <Layout pageTitle={`Product: ${product.name}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              to={`/products/${id}/edit`}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Product</span>
            </Link>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </div>

        {/* Main Product Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-8">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
                <Boxes className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 mb-1">
                  SKU: {product.sku}
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{product.name}</h1>
                <p className="text-xs text-slate-500 mt-1">{product.description || 'No description provided.'}</p>
              </div>
            </div>

            {/* Stock Status Badge */}
            <div>
              {isOutOfStock ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                  <AlertTriangle className="w-4 h-4 mr-1.5 text-red-600" /> Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600" /> Low Stock Warning
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> In Stock
                </span>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
              <p className="text-xs font-semibold uppercase text-slate-400">Current Stock</p>
              <p className="text-2xl font-extrabold text-slate-900">
                {product.quantityOnHand} <span className="text-xs text-slate-500 font-normal">{product.unitOfMeasure}</span>
              </p>
              <p className="text-[11px] text-slate-400">Reorder Threshold: {product.reorderPoint} {product.unitOfMeasure}</p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
              <p className="text-xs font-semibold uppercase text-slate-400">Category</p>
              <p className="text-base font-bold text-slate-900 flex items-center space-x-2 mt-1">
                <FolderTree className="w-4 h-4 text-indigo-600" />
                <span>{product.category?.name || 'Unassigned'}</span>
              </p>
              <p className="text-[11px] font-mono text-slate-400">Code: {product.category?.code || 'N/A'}</p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
              <p className="text-xs font-semibold uppercase text-slate-400">Unit of Measure</p>
              <p className="text-base font-bold text-slate-900 flex items-center space-x-2 mt-1">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span>{product.unitOfMeasure}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
              <p className="text-xs font-semibold uppercase text-slate-400">Sales Price</p>
              <p className="text-2xl font-extrabold text-slate-900">
                ${parseFloat(product.salesPrice).toFixed(2)}
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
              <p className="text-xs font-semibold uppercase text-slate-400">Cost Price</p>
              <p className="text-2xl font-extrabold text-slate-700">
                ${parseFloat(product.costPrice).toFixed(2)}
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
              <p className="text-xs font-semibold uppercase text-slate-400">Barcode</p>
              <p className="text-sm font-mono font-semibold text-slate-800 mt-1">
                {product.barcode || '—'}
              </p>
            </div>
          </div>

          {/* Timestamp Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created: {product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last Updated: {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'N/A'}</span>
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
