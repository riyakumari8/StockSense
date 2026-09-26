import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import warehouseService from '../services/warehouseService';
import locationService from '../services/locationService';
import {
  Building2,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2,
  Filter,
  Check,
  Ban
} from 'lucide-react';

export default function Warehouses() {
  const [activeTab, setActiveTab] = useState('warehouses'); // warehouses or locations

  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Location filter
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState('');

  // Warehouse Modal
  const [whModalOpen, setWhModalOpen] = useState(false);
  const [editingWh, setEditingWh] = useState(null);
  const [whFormData, setWhFormData] = useState({ name: '', code: '', address: '', active: true });
  const [whErrors, setWhErrors] = useState({});

  // Location Modal
  const [locModalOpen, setLocModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [locFormData, setLocFormData] = useState({ name: '', code: '', warehouseId: '', description: '', active: true });
  const [locErrors, setLocErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [whData, locData] = await Promise.all([
        warehouseService.getAll(),
        locationService.getAll()
      ]);
      setWarehouses(whData);
      setLocations(locData);
    } catch (err) {
      setError(err.message || 'Failed to load warehouses & locations');
    } finally {
      setLoading(false);
    }
  };

  // Warehouse Modal Handlers
  const handleOpenWhModal = (wh = null) => {
    if (wh) {
      setEditingWh(wh);
      setWhFormData({ name: wh.name, code: wh.code, address: wh.address || '', active: wh.active });
    } else {
      setEditingWh(null);
      setWhFormData({ name: '', code: '', address: '', active: true });
    }
    setWhErrors({});
    setWhModalOpen(true);
  };

  const handleWhSubmit = async (e) => {
    e.preventDefault();
    if (!whFormData.name.trim()) { setWhErrors({ name: 'Name is required' }); return; }
    if (!whFormData.code.trim()) { setWhErrors({ code: 'Code is required' }); return; }

    setIsSubmitting(true);
    setWhErrors({});

    try {
      if (editingWh) {
        await warehouseService.update(editingWh.id, whFormData);
        setSuccessMsg('Warehouse updated successfully!');
      } else {
        await warehouseService.create(whFormData);
        setSuccessMsg('Warehouse created successfully!');
      }
      setWhModalOpen(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setWhErrors({ server: err.message || 'Failed to save warehouse' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWh = async (id, name) => {
    if (!window.confirm(`Deactivate warehouse "${name}"?`)) return;
    try {
      await warehouseService.delete(id);
      setSuccessMsg('Warehouse deactivated');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Location Modal Handlers
  const handleOpenLocModal = (loc = null) => {
    if (loc) {
      setEditingLoc(loc);
      setLocFormData({
        name: loc.name,
        code: loc.code,
        warehouseId: loc.warehouse ? loc.warehouse.id.toString() : '',
        description: loc.description || '',
        active: loc.active
      });
    } else {
      setEditingLoc(null);
      setLocFormData({
        name: '',
        code: '',
        warehouseId: warehouses.length > 0 ? warehouses[0].id.toString() : '',
        description: '',
        active: true
      });
    }
    setLocErrors({});
    setLocModalOpen(true);
  };

  const handleLocSubmit = async (e) => {
    e.preventDefault();
    if (!locFormData.name.trim()) { setLocErrors({ name: 'Name is required' }); return; }
    if (!locFormData.code.trim()) { setLocErrors({ code: 'Code is required' }); return; }
    if (!locFormData.warehouseId) { setLocErrors({ warehouseId: 'Warehouse selection is required' }); return; }

    setIsSubmitting(true);
    setLocErrors({});

    const payload = {
      ...locFormData,
      warehouseId: parseInt(locFormData.warehouseId, 10)
    };

    try {
      if (editingLoc) {
        await locationService.update(editingLoc.id, payload);
        setSuccessMsg('Location updated successfully!');
      } else {
        await locationService.create(payload);
        setSuccessMsg('Location created successfully!');
      }
      setLocModalOpen(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setLocErrors({ server: err.message || 'Failed to save location' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLoc = async (id, name) => {
    if (!window.confirm(`Deactivate location "${name}"?`)) return;
    try {
      await locationService.delete(id);
      setSuccessMsg('Location deactivated');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredLocations = locations.filter((l) => {
    if (selectedWarehouseFilter && l.warehouse?.id !== parseInt(selectedWarehouseFilter, 10)) return false;
    return true;
  });

  return (
    <Layout pageTitle="Warehouses & Storage Locations">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('warehouses')}
              className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors ${
                activeTab === 'warehouses'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Warehouses ({warehouses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('locations')}
              className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors ${
                activeTab === 'locations'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Locations ({locations.length})</span>
            </button>
          </div>

          <div>
            {activeTab === 'warehouses' ? (
              <button
                onClick={() => handleOpenWhModal()}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Warehouse</span>
              </button>
            ) : (
              <button
                onClick={() => handleOpenLocModal()}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Location</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: WAREHOUSES TABLE */}
        {activeTab === 'warehouses' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <span>Loading warehouses...</span>
              </div>
            ) : warehouses.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No warehouses registered yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                      <th className="py-3.5 px-6">Code</th>
                      <th className="py-3.5 px-6">Warehouse Name</th>
                      <th className="py-3.5 px-6">Address</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {warehouses.map((wh) => (
                      <tr key={wh.id} className="hover:bg-slate-50/60">
                        <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-600">
                          {wh.code}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {wh.name}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600">
                          {wh.address || '—'}
                        </td>
                        <td className="py-4 px-6">
                          {wh.active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3 mr-1" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                              <Ban className="w-3 h-3 mr-1" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleOpenWhModal(wh)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWh(wh.id, wh.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LOCATIONS TABLE */}
        {activeTab === 'locations' && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedWarehouseFilter}
                onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-500">Loading locations...</div>
              ) : filteredLocations.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No storage locations found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                        <th className="py-3.5 px-6">Location Code</th>
                        <th className="py-3.5 px-6">Location Name</th>
                        <th className="py-3.5 px-6">Warehouse</th>
                        <th className="py-3.5 px-6">Description</th>
                        <th className="py-3.5 px-6">Status</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredLocations.map((loc) => (
                        <tr key={loc.id} className="hover:bg-slate-50/60">
                          <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-600">
                            {loc.code}
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {loc.name}
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-700">
                            <span className="font-semibold">{loc.warehouse?.name}</span>
                            <span className="font-mono text-slate-400 ml-1">({loc.warehouse?.code})</span>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-500">
                            {loc.description || '—'}
                          </td>
                          <td className="py-4 px-6">
                            {loc.active ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => handleOpenLocModal(loc)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLoc(loc.id, loc.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* WAREHOUSE MODAL */}
      {whModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">{editingWh ? 'Edit Warehouse' : 'Add Warehouse'}</h3>
              <button onClick={() => setWhModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {whErrors.server && <p className="text-xs text-red-600">{whErrors.server}</p>}

            <form onSubmit={handleWhSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  value={whFormData.name}
                  onChange={(e) => setWhFormData({ ...whFormData, name: e.target.value })}
                  placeholder="e.g. Central Logistics Hub"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Warehouse Code *</label>
                <input
                  type="text"
                  required
                  value={whFormData.code}
                  onChange={(e) => setWhFormData({ ...whFormData, code: e.target.value })}
                  placeholder="e.g. WH-MAIN"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Address</label>
                <textarea
                  rows="2"
                  value={whFormData.address}
                  onChange={(e) => setWhFormData({ ...whFormData, address: e.target.value })}
                  placeholder="Physical street address..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setWhModalOpen(false)} className="px-3.5 py-2 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md">
                  {isSubmitting ? 'Saving...' : 'Save Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCATION MODAL */}
      {locModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">{editingLoc ? 'Edit Location' : 'Add Location'}</h3>
              <button onClick={() => setLocModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {locErrors.server && <p className="text-xs text-red-600">{locErrors.server}</p>}

            <form onSubmit={handleLocSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Warehouse *</label>
                <select
                  value={locFormData.warehouseId}
                  onChange={(e) => setLocFormData({ ...locFormData, warehouseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  value={locFormData.name}
                  onChange={(e) => setLocFormData({ ...locFormData, name: e.target.value })}
                  placeholder="e.g. Rack A1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Location Code *</label>
                <input
                  type="text"
                  required
                  value={locFormData.code}
                  onChange={(e) => setLocFormData({ ...locFormData, code: e.target.value })}
                  placeholder="e.g. RA-01"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={locFormData.description}
                  onChange={(e) => setLocFormData({ ...locFormData, description: e.target.value })}
                  placeholder="Rack or bin location details..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setLocModalOpen(false)} className="px-3.5 py-2 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md">
                  {isSubmitting ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
