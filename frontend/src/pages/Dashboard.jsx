import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  CheckCircle2
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
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Boxes className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Stock<span className="text-indigo-600">Sense</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                Enterprise v1.0
              </span>
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 pr-4 border-r border-slate-200">
                <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-slate-800 leading-none">
                    {user?.name || 'Authorized User'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'user@example.com'}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3.5 py-2 border border-slate-300 shadow-sm text-xs font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                <LogOut className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

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

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outbound Deliveries</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">32</p>
              <p className="text-xs text-purple-600 font-medium mt-2">
                Dispatched today
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        StockSense Management System • Built for Odoo Hackathon 2026
      </footer>
    </div>
  );
}
