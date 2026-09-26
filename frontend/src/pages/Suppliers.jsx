import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import supplierService from '../services/supplierService';
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  User,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  Users
} from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewSupplier, setViewSupplier] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    supplierName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async (query = searchQuery) => {
    setLoading(true);
    try {
      const data = await supplierService.getAll(query);
      setSuppliers(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSuppliers(searchQuery);
  };

  const handleOpenAdd = () => {
    setFormData({
      supplierName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: ''
    });
    setFormErrors({});
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setFormData({
      supplierName: supplier.supplierName || '',
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || ''
    });
    setFormErrors({});
    setIsEditing(true);
    setEditingId(supplier.id);
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.supplierName.trim()) {
      errors.supplierName = 'Supplier name is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (isEditing) {
        await supplierService.update(editingId, formData);
        setSuccessMsg('Supplier updated successfully');
      } else {
        await supplierService.create(formData);
        setSuccessMsg('Supplier added successfully');
      }
      setIsModalOpen(false);
      fetchSuppliers(searchQuery);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save supplier');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (supplier) => {
    if (!window.confirm(`Are you sure you want to delete supplier "${supplier.supplierName}"?`)) {
      return;
    }
    try {
      await supplierService.delete(supplier.id);
      setSuccessMsg(`Supplier "${supplier.supplierName}" deleted successfully`);
      fetchSuppliers(searchQuery);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Cannot delete supplier');
      setTimeout(() => setError(''), 6000);
    }
  };

  return (
    <Layout pageTitle="Supplier Management">
      <div className="space-y-6">
        {/* Notifications */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header / Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Suppliers</h2>
            <p className="text-sm text-slate-500">
              Manage vendors and procurement contacts for incoming stock receipts.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Suppliers</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : suppliers.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">With Direct Contacts</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : suppliers.filter(s => s.contactPerson).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Communications</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : suppliers.filter(s => s.email && s.phone).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Mail className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by supplier name, contact person, email, or phone..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  fetchSuppliers('');
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-colors"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500 font-medium">Loading suppliers catalog...</p>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No suppliers found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery ? 'No suppliers match your search criteria.' : 'Get started by creating your first supplier to receive incoming inventory.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleOpenAdd}
                  className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Supplier</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Supplier Name</th>
                    <th className="px-6 py-4">Contact Person</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{s.supplierName}</p>
                            <span className="text-[11px] text-slate-400">ID: #{s.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {s.contactPerson ? (
                          <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{s.contactPerson}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {s.phone ? (
                          <div className="flex items-center space-x-1.5 text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{s.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {s.email ? (
                          <div className="flex items-center space-x-1.5 text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{s.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        {s.address ? (
                          <span className="text-slate-600">{s.address}</span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setViewSupplier(s)}
                            title="View details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            title="Edit supplier"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            title="Delete supplier"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Supplier Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="e.g. Acme Industrial Supplies Ltd"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                    formErrors.supplierName ? 'border-red-400' : 'border-slate-200'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white`}
                />
                {formErrors.supplierName && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.supplierName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +1 555-0199"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sales@acme.com"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                      formErrors.email ? 'border-red-400' : 'border-slate-200'
                    } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white`}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Address
                </label>
                <textarea
                  rows="3"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 100 Industrial Parkway, Chicago, IL"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                ></textarea>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isEditing ? 'Save Changes' : 'Create Supplier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Supplier Details Modal */}
      {viewSupplier && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viewSupplier.supplierName}</h3>
                  <p className="text-xs text-slate-400">Supplier ID #{viewSupplier.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewSupplier(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-sm">
                  <User className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Contact Person</p>
                    <p className="text-slate-800 font-medium">{viewSupplier.contactPerson || 'None specified'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Phone</p>
                    <p className="text-slate-800 font-medium">{viewSupplier.phone || 'None specified'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Email</p>
                    <p className="text-slate-800 font-medium">{viewSupplier.email || 'None specified'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Address</p>
                    <p className="text-slate-800 font-medium">{viewSupplier.address || 'None specified'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const supp = viewSupplier;
                    setViewSupplier(null);
                    handleOpenEdit(supp);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold"
                >
                  Edit Information
                </button>
                <button
                  type="button"
                  onClick={() => setViewSupplier(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
