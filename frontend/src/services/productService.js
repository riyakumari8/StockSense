import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api/products';

export const productService = {
  /**
   * Fetch all products
   * @returns {Promise<Array>}
   */
  async getAllProducts() {
    try {
      const token = authService.getToken();
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch products');
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to StockSense server. Please ensure backend is running.');
      }
      throw error;
    }
  },

  /**
   * Search products by name or SKU
   * @param {string} query
   * @returns {Promise<Array>}
   */
  async searchProducts(query) {
    try {
      const token = authService.getToken();
      const url = query ? `${API_BASE_URL}?search=${encodeURIComponent(query)}` : API_BASE_URL;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to search products');
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to StockSense server. Please ensure backend is running.');
      }
      throw error;
    }
  },

  /**
   * Get single product by ID
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async getProductById(id) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch product #${id}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to StockSense server. Please ensure backend is running.');
      }
      throw error;
    }
  }
};

export default productService;
