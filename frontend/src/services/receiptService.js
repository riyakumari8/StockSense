import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api/receipts';

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const receiptService = {
  async getAll({ search = '', status = '', supplierId = '' } = {}) {
    let url = API_BASE_URL;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (supplierId) params.append('supplierId', supplierId);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch receipts list');
    return res.json();
  },

  async getReceipts(filters) {
    return this.getAll(filters);
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch receipt #${id}`);
    return res.json();
  },

  async getReceipt(id) {
    return this.getById(id);
  },

  async create(data) {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create receipt');
    return result;
  },

  async createReceipt(data) {
    return this.create(data);
  },

  async update(id, data) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to update receipt');
    return result;
  },

  async updateReceipt(id, data) {
    return this.update(id, data);
  },

  async validateReceipt(id) {
    const res = await fetch(`${API_BASE_URL}/${id}/validate`, {
      method: 'POST',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to validate receipt');
    return result;
  },

  async cancelReceipt(id) {
    const res = await fetch(`${API_BASE_URL}/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to cancel receipt');
    return result;
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to delete receipt');
    return result;
  },

  async deleteReceipt(id) {
    return this.delete(id);
  }
};

export default receiptService;
