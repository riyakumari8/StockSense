import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api/deliveries';

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const deliveryService = {
  /**
   * Fetch deliveries with optional search and status filter
   * @param {string} [search]
   * @param {string} [status]
   * @returns {Promise<Array>}
   */
  async getDeliveries(search = '', status = '') {
    try {
      const params = new URLSearchParams();
      if (search && search.trim()) params.append('search', search.trim());
      if (status && status !== 'ALL') params.append('status', status);

      const queryString = params.toString();
      const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch delivery orders');
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
   * Fetch single delivery order by ID
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async getDeliveryById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Delivery #${id} not found`);
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
   * Create a new delivery order (saved as DRAFT)
   * @param {Object} deliveryData - { customerName, items: [{ productId, quantity }] }
   * @returns {Promise<Object>}
   */
  async createDelivery(deliveryData) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(deliveryData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create delivery order');
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to StockSense server. Please ensure backend is running.');
      }
      throw error;
    }
  },

  /**
   * Pick delivery: verify products and stock, transitions to PICKED
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async pickDelivery(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/pick`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to pick delivery items');
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to StockSense server. Please ensure backend is running.');
      }
      throw error;
    }
  },

  /**
   * Pack delivery: packaging verification, transitions to PACKED
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async packDelivery(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/pack`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to pack delivery items');
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to StockSense server. Please ensure backend is running.');
      }
      throw error;
    }
  },

  /**
   * Validate delivery: final check, reduces stock in warehouse and records StockLedger
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async validateDelivery(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/validate`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to validate delivery');
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to StockSense server. Please ensure backend is running.');
      }
      throw error;
    }
  },

  /**
   * Cancel delivery order
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async cancelDelivery(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel delivery');
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to StockSense server. Please ensure backend is running.');
      }
      throw error;
    }
  },

  /**
   * Get stock ledger movement history for this delivery
   * @param {number|string} id
   * @returns {Promise<Array>}
   */
  async getDeliveryLedger(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/ledger`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch stock movement records');
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

export default deliveryService;
