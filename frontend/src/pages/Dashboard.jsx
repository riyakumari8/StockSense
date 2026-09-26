import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import receiptService from '../services/receiptService';
import deliveryService from '../services/deliveryService';
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
  Loader2,
  PackageCheck,
  Users,
  Truck
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [pendingReceiptsCount, setPendingReceiptsCount] = useState(0);
  const [pendingDeliveriesCount, setPendingDeliveriesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [prodsData, catsData, lowStockData, receiptsData, deliveriesData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        productService.getLowStock(),
        receiptService.getAll({ status: 'DRAFT' }).catch(() => []),
        deliveryService.getAll().catch(() => [])
      ]);
      setProducts(prodsData);
      setCategories(catsData);
      setLowStockProducts(lowStockData);
      setPendingReceiptsCount(Array.isArray(receiptsData) ? receiptsData.length : 0);
      const pendingDel = Array.isArray(deliveriesData)
        ? deliveriesData.filter((d) => d.status !== 'VALIDATED' && d.status !== 'CANCELLED').length
        : 0;
      setPendingDeliveriesCount(pendingDel);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Metric 1 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total SKUs</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : products.length}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Active catalog items
              </p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Low Stock</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-amber-600" /> : lowStockProducts.length}
              </p>
              <p className="text-[11px] text-amber-600 font-medium mt-1">
                Requires reorder
              </p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Receipts</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <PackageCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : pendingReceiptsCount}
              </p>
              <Link to="/receipts" className="text-[11px] text-blue-600 hover:underline font-semibold mt-1 inline-block">
                Draft receipts →
              </Link>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Deliveries</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : pendingDeliveriesCount}
              </p>
              <Link to="/deliveries" className="text-[11px] text-indigo-600 hover:underline font-semibold mt-1 inline-block">
                In-progress orders →
              </Link>
            </div>
          </div>

          {/* Metric 5 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Valuation</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 truncate">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-emerald-600" /> : `$${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                At cost prices
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
      </div>
    </Layout>
  );
}
