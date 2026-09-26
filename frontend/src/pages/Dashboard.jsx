import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  FolderTree,
  DollarSign,
  Plus,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [prodsData, catsData, lowStockData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        productService.getLowStock()
      ]);
      setProducts(prodsData);
      setCategories(catsData);
      setLowStockProducts(lowStockData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate live inventory value
  const totalInventoryValue = products.reduce((acc, p) => {
    return acc + (p.quantityOnHand * parseFloat(p.costPrice || 0));
  }, 0);

  return (
    <Layout pageTitle="Inventory Dashboard">
      <div className="space-y-8">
        {/* Hero Welcome Card */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Real-Time Inventory Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.name || 'Inventory Manager'}!
            </h1>
            <p className="text-indigo-200 text-sm max-w-2xl">
              StockSense Central Command Center. Monitor product stock levels, low-stock warnings, and valuation in real time.
            </p>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Metric 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total SKUs</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-indigo-600" /> : products.length}
              </p>
              <p className="text-xs text-slate-500 font-medium flex items-center mt-2">
                Active catalog items
              </p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock Warnings</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-amber-600" /> : lowStockProducts.length}
              </p>
              <p className="text-xs text-amber-600 font-medium mt-2">
                Requires reordering attention
              </p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categories</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <FolderTree className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> : categories.length}
              </p>
              <p className="text-xs text-blue-600 font-medium mt-2">
                Structured categories
              </p>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Valuation</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-emerald-600" /> : `$${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
              <p className="text-xs text-emerald-600 font-medium mt-2">
                Based on cost prices
              </p>
            </div>
          </div>
        </div>

        {/* Low Stock Alert Table Preview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Low Stock Items Requiring Action</span>
            </h3>
            <Link
              to="/products"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>Manage Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400">Loading live stock levels...</div>
          ) : lowStockProducts.length === 0 ? (
            <div className="py-8 text-center text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200/80 text-xs font-semibold">
              ✓ All stock levels are currently healthy! No items below reorder thresholds.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3 px-4">SKU / Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">On Hand</th>
                    <th className="py-3 px-4">Reorder Point</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {p.name} <span className="font-mono text-indigo-600 font-normal">({p.sku})</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.category?.name || 'Unassigned'}</td>
                      <td className="py-3 px-4 font-extrabold text-amber-800">{p.quantityOnHand} {p.unitOfMeasure}</td>
                      <td className="py-3 px-4 text-slate-500">{p.reorderPoint} {p.unitOfMeasure}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          Reorder Needed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Inward Operations & Procurement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Operations</span>
                <h3 className="text-lg font-bold text-slate-900">Inward Stock Receipts</h3>
                <p className="text-xs text-slate-500">
                  Receive vendor shipments, inspect line items, and validate receipts to automatically update live product stock.
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Boxes className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <Link
                to="/receipts/new"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Receipt</span>
              </Link>
              <Link
                to="/receipts"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                <span>View All Receipts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Procurement</span>
                <h3 className="text-lg font-bold text-slate-900">Supplier Directory</h3>
                <p className="text-xs text-slate-500">
                  Manage vendor profiles, procurement points of contact, and link suppliers to incoming inventory orders.
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <FolderTree className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <Link
                to="/suppliers"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
              >
                <span>Manage Suppliers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
