import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api/deliveries';

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const deliveryService = {
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.warehouseId) queryParams.append('warehouseId', params.warehouseId);
    if (params.search) queryParams.append('search', params.search);

    const url = queryParams.toString() ? `${API_BASE_URL}?${queryParams.toString()}` : API_BASE_URL;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch delivery orders');
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch delivery order details');
    return res.json();
  },

  async create(data) {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create delivery order');
    return result;
  },

  async pick(id) {
    const res = await fetch(`${API_BASE_URL}/${id}/pick`, {
      method: 'POST',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to pick delivery order');
    return result;
  },

  async pack(id) {
    const res = await fetch(`${API_BASE_URL}/${id}/pack`, {
      method: 'POST',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to pack delivery order');
    return result;
  },

  async validate(id) {
    const res = await fetch(`${API_BASE_URL}/${id}/validate`, {
      method: 'POST',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to validate delivery order');
    return result;
  },

  async cancel(id) {
    const res = await fetch(`${API_BASE_URL}/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to cancel delivery order');
    return result;
  },

  // Method Aliases
  async getDeliveries(params = {}) {
    return this.getAll(params);
  },
  async getDelivery(id) {
    return this.getById(id);
  },
  async createDelivery(data) {
    return this.create(data);
  },
  async pickDelivery(id) {
    return this.pick(id);
  },
  async packDelivery(id) {
    return this.pack(id);
  },
  async validateDelivery(id) {
    return this.validate(id);
  },
  async cancelDelivery(id) {
    return this.cancel(id);
  }
};

export default deliveryService;
