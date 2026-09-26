import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData.email.trim(), formData.password, formData.rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-6 sm:py-12 lg:py-0">
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT SIDE - Enterprise Visual Branding */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-12 flex-col justify-between relative overflow-hidden text-white">
          {/* Subtle Background Geometric Accents */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Branding Header */}
          <div className="relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center backdrop-blur-md">
                <Boxes className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Stock<span className="text-indigo-400">Sense</span>
              </span>
            </div>
          </div>

          {/* Hero Content Section */}
          <div className="relative z-10 my-auto py-12">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 text-xs font-medium mb-6">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Smart Inventory Management System</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
              Manage Your Inventory <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-200 to-white">
                Smarter & Faster
              </span>
            </h1>

            <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-md">
              Track products, stock movements, receipts and deliveries from one centralized, enterprise-grade platform.
            </p>

            {/* Subtle Inventory Visual UI Card */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 shadow-2xl space-y-4 max-w-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Stock Turnover</p>
                    <p className="text-xs text-slate-400">Real-time sync active</p>
                  </div>
                </div>
                <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  +24.8%
                </span>
              </div>

              {/* Minimal feature list pills */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="flex items-center space-x-2 bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-700/40 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>Real-time Tracking</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-700/40 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>Auto Reordering</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-700/40 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>Multi-Warehouse</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-700/40 text-xs text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>Role Permissions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
            <span>© 2026 StockSense Inc.</span>
            <span>Odoo Hackathon Edition</span>
          </div>
        </div>

        {/* RIGHT SIDE - Clean Login Card & Form */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-16 py-12 bg-white">
          <div className="w-full max-w-md space-y-8">
            {/* Header branding for mobile & title */}
            <div className="text-center lg:text-left space-y-2">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Boxes className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  Stock<span className="text-indigo-600">Sense</span>
                </span>
              </div>

              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 font-normal">
                Sign in to your StockSense account
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200/80 flex items-start space-x-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm text-red-700 font-medium">
                  {serverError}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Email Address
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={`block w-full pl-11 pr-4 py-3 bg-slate-50/50 border ${
                      errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600'
                    } rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors`}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-xs text-red-600 mt-1 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    className={`block w-full pl-11 pr-11 py-3 bg-slate-50/50 border ${
                      errors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600'
                    } rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-xs text-red-600 mt-1 font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 select-none">
                    Remember me for 30 days
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 transition-all duration-150 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-medium">OR</span>
              </div>
            </div>

            {/* Register Footer Link */}
            <div className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
