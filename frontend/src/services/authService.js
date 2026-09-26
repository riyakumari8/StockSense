const API_BASE_URL = 'http://localhost:8080/api/auth';

export const authService = {
  /**
   * Log in user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} { token, user }
   */
  async login({ email, password }) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password');
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
   * Register new user
   * @param {Object} userData - { name, email, password, phone }
   * @returns {Promise<Object>} { message }
   */
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please check your information.');
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
   * Store token and user details in storage
   */
  saveSession(token, user, rememberMe = false) {
    const storage = rememberMe ? localStorage : sessionStorage;
    // Always clear existing to avoid duplication
    localStorage.removeItem('stocksense_token');
    localStorage.removeItem('stocksense_user');
    sessionStorage.removeItem('stocksense_token');
    sessionStorage.removeItem('stocksense_user');

    storage.setItem('stocksense_token', token);
    storage.setItem('stocksense_user', JSON.stringify(user));
  },

  /**
   * Retrieve active token
   */
  getToken() {
    return localStorage.getItem('stocksense_token') || sessionStorage.getItem('stocksense_token');
  },

  /**
   * Retrieve active user object
   */
  getUser() {
    const userStr = localStorage.getItem('stocksense_user') || sessionStorage.getItem('stocksense_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Clear active session
   */
  clearSession() {
    localStorage.removeItem('stocksense_token');
    localStorage.removeItem('stocksense_user');
    sessionStorage.removeItem('stocksense_token');
    sessionStorage.removeItem('stocksense_user');
  }
};

export default authService;
