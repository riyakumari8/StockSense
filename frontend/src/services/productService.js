import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api/products';

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const productService = {
  async getAll(searchQuery = '') {
    const url = searchQuery
      ? `${API_BASE_URL}?search=${encodeURIComponent(searchQuery)}`
      : API_BASE_URL;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getLowStock() {
    const res = await fetch(`${API_BASE_URL}/low-stock`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch low stock products');
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch product details');
    return res.json();
  },

  async create(data) {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create product');
    return result;
  },

  async update(id, data) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to update product');
    return result;
  },

  async updateStock(id, adjustment) {
    const res = await fetch(`${API_BASE_URL}/${id}/stock`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ adjustment })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to update stock');
    return result;
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete product');
  }
};

export default productService;
