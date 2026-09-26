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
  async getAll(searchQuery = '') {
    let url = API_BASE_URL;
    if (searchQuery) {
      url += `?search=${encodeURIComponent(searchQuery)}`;
    }
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch suppliers list');
    return res.json();
  },

  async getSuppliers(searchQuery = '') {
    return this.getAll(searchQuery);
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch supplier #${id}`);
    return res.json();
  },

  async getSupplier(id) {
    return this.getById(id);
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

  async createSupplier(data) {
    return this.create(data);
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

  async updateSupplier(id, data) {
    return this.update(id, data);
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to delete supplier');
    return result;
  },

  async deleteSupplier(id) {
    return this.delete(id);
  }
};

export default supplierService;
