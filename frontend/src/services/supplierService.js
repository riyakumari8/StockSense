import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api/suppliers';

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const supplierService = {
  async getAll(search = '') {
    const url = search ? `${API_BASE_URL}?search=${encodeURIComponent(search)}` : API_BASE_URL;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch suppliers');
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch supplier details');
    return res.json();
  },

  async create(data) {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create supplier');
    return result;
  },

  async update(id, data) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to update supplier');
    return result;
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to deactivate supplier');
    return res.json();
  },

  // Method Aliases
  async getSuppliers(search = '') {
    return this.getAll(search);
  },
  async getSupplier(id) {
    return this.getById(id);
  },
  async createSupplier(data) {
    return this.create(data);
  },
  async updateSupplier(id, data) {
    return this.update(id, data);
  },
  async deleteSupplier(id) {
    return this.delete(id);
  }
};

export default supplierService;
