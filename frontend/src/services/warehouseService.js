import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api/warehouses';

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const warehouseService = {
  async getAll() {
    const res = await fetch(API_BASE_URL, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch warehouses');
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch warehouse details');
    return res.json();
  },

  async create(data) {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create warehouse');
    return result;
  },

  async update(id, data) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to update warehouse');
    return result;
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete warehouse');
  }
};

export default warehouseService;
