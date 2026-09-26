import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api/ledger';

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const ledgerService = {
  async getMoveHistory(productId = '', locationId = '', movementType = '') {
    let url = 'http://localhost:8080/api/move-history';
    const params = new URLSearchParams();
    if (productId) params.append('productId', productId);
    if (locationId) params.append('locationId', locationId);
    if (movementType) params.append('movementType', movementType);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch stock move history');
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch ledger entry #${id}`);
    return res.json();
  }
};

export default ledgerService;
