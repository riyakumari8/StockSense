import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  Boxes,
  LogOut,
  User as UserIcon,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  Truck
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>JWT Authentication Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.name || 'Inventory Manager'}!
            </h1>
            <p className="text-indigo-200 text-sm max-w-2xl">
              You are signed into StockSense as <span className="font-semibold text-white">{user?.role || 'USER'}</span>. All inventory nodes are synchronized in real-time.
            </p>
          </div>
        </div>

        {/* User Session Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <UserIcon className="w-5 h-5 text-indigo-600" />
            <span>Active Session Account Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase">User ID</p>
              <p className="text-lg font-bold text-slate-900 mt-1">#{user?.id || 1}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase">Email Address</p>
              <p className="text-sm font-semibold text-slate-900 mt-1 truncate">{user?.email}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase">Assigned Role</p>
              <p className="text-sm font-semibold text-indigo-600 mt-1">{user?.role}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase">Security Token</p>
              <p className="text-xs font-mono text-emerald-600 mt-1 truncate">
                {token ? `${token.substring(0, 18)}...` : 'Valid JWT'}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Overview Stat Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total SKUs</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">2,845</p>
              <p className="text-xs text-emerald-600 font-medium flex items-center mt-2">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12% from last month
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock Alert</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">14</p>
              <p className="text-xs text-amber-600 font-medium mt-2">
                Requires reorder attention
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Receipts</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">8</p>
              <p className="text-xs text-blue-600 font-medium mt-2">
                Expected today
              </p>
            </div>
          </div>

          <Link
            to="/deliveries"
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-purple-600 transition-colors">Outbound Deliveries</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">32</p>
              <p className="text-xs text-purple-600 font-medium mt-2 flex items-center">
                <span>Manage Delivery Orders</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </p>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        StockSense Management System • Built for Odoo Hackathon 2026
      </footer>
    </div>
  );
}
