import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api/stock-ledger';

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const stockLedgerService = {
  async getEntries({ productId = '', movementType = '' } = {}) {
    let url = API_BASE_URL;
    const params = new URLSearchParams();
    if (productId) params.append('productId', productId);
    if (movementType) params.append('movementType', movementType);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch stock ledger');
    return res.json();
  }
};

export default stockLedgerService;
