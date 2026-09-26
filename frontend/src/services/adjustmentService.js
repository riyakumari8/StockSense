import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api/adjustments';

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const adjustmentService = {
  async getAll() {
    const res = await fetch(API_BASE_URL, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch stock adjustments');
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch adjustment #${id}`);
    return res.json();
  },

  async create(data) {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create adjustment');
    return result;
  },

  async validate(id) {
    const res = await fetch(`${API_BASE_URL}/${id}/validate`, {
      method: 'POST',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to validate adjustment');
    return result;
  },

  async cancel(id) {
    const res = await fetch(`${API_BASE_URL}/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to cancel adjustment');
    return result;
  }
};

export default adjustmentService;
