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
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.supplierId) queryParams.append('supplierId', params.supplierId);
    if (params.warehouseId) queryParams.append('warehouseId', params.warehouseId);
    if (params.search) queryParams.append('search', params.search);

    const url = queryParams.toString() ? `${API_BASE_URL}?${queryParams.toString()}` : API_BASE_URL;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch receipts');
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch receipt details');
    return res.json();
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

  async validate(id) {
    const res = await fetch(`${API_BASE_URL}/${id}/validate`, {
      method: 'POST',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to validate receipt');
    return result;
  },

  async cancel(id) {
    const res = await fetch(`${API_BASE_URL}/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to cancel receipt');
    return result;
  },

  // Method Aliases
  async getReceipts(params = {}) {
    return this.getAll(params);
  },
  async getReceipt(id) {
    return this.getById(id);
  },
  async createReceipt(data) {
    return this.create(data);
  },
  async validateReceipt(id) {
    return this.validate(id);
  },
  async cancelReceipt(id) {
    return this.cancel(id);
  }
};

export default receiptService;
