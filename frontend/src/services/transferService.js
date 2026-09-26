import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api/transfers';

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const transferService = {
  async getAll(status = '', locationId = '') {
    let url = API_BASE_URL;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (locationId) params.append('locationId', locationId);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch transfers');
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch transfer #${id}`);
    return res.json();
  },

  async create(data) {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create transfer');
    return result;
  },

  async validate(id) {
    const res = await fetch(`${API_BASE_URL}/${id}/validate`, {
      method: 'POST',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to validate transfer');
    return result;
  },

  async cancel(id) {
    const res = await fetch(`${API_BASE_URL}/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to cancel transfer');
    return result;
  }
};

export default transferService;
