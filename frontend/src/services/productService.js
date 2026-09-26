import authService from './authService';
import categoryService from './categoryService';

const API_BASE_URL = 'http://localhost:8080/api/products';

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const productService = {
  async getAll(searchQuery = '', categoryId = '') {
    let url = API_BASE_URL;
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (categoryId) params.append('categoryId', categoryId);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch products list');
    return res.json();
  },

  async getProducts(searchQuery = '', categoryId = '') {
    return this.getAll(searchQuery, categoryId);
  },

  async getLowStock() {
    const res = await fetch(`${API_BASE_URL}/low-stock`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch low stock products');
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch product #${id}`);
    return res.json();
  },

  async getProduct(id) {
    return this.getById(id);
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

  async createProduct(data) {
    return this.create(data);
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

  async updateProduct(id, data) {
    return this.update(id, data);
  },

  async updateStock(id, adjustment) {
    const res = await fetch(`${API_BASE_URL}/${id}/stock`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ adjustment })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to adjust stock');
    return result;
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  async deleteProduct(id) {
    return this.delete(id);
  },

  async getCategories() {
    return categoryService.getAll();
  }
};

export default productService;
