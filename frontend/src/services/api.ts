import axios from 'axios';
import type {
  Warehouse, WarehouseRequest, Location, LocationRequest,
  Transfer, TransferRequest, StockAdjustment, AdjustmentRequest,
  StockLedgerEntry, PageResponse, Product, Stock, MovementType,
  TransferStatus, AdjustmentStatus,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Warehouses ──────────────────────────────────────────────
export const warehouseApi = {
  getAll: () => api.get<Warehouse[]>('/warehouses').then(r => r.data),
  getById: (id: number) => api.get<Warehouse>(`/warehouses/${id}`).then(r => r.data),
  create: (data: WarehouseRequest) => api.post<Warehouse>('/warehouses', data).then(r => r.data),
  update: (id: number, data: WarehouseRequest) => api.put<Warehouse>(`/warehouses/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/warehouses/${id}`),
};

// ── Locations ───────────────────────────────────────────────
export const locationApi = {
  getAll: (warehouseId?: number) =>
    api.get<Location[]>('/locations', { params: warehouseId ? { warehouseId } : {} }).then(r => r.data),
  getById: (id: number) => api.get<Location>(`/locations/${id}`).then(r => r.data),
  create: (data: LocationRequest) => api.post<Location>('/locations', data).then(r => r.data),
  update: (id: number, data: LocationRequest) => api.put<Location>(`/locations/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/locations/${id}`),
};

// ── Products (read-only for Member 4) ──────────────────────
export const productApi = {
  getAll: () => api.get<Product[]>('/products').then(r => r.data).catch(() => []),
};

// ── Stock ───────────────────────────────────────────────────
export const stockApi = {
  getByLocation: (locationId: number) =>
    api.get<Stock[]>('/stocks', { params: { locationId } }).then(r => r.data),
  getByWarehouse: (warehouseId: number) =>
    api.get<Stock[]>('/stocks', { params: { warehouseId } }).then(r => r.data),
  getQuantity: (productId: number, locationId: number) =>
    api.get<number>('/stocks/quantity', { params: { productId, locationId } }).then(r => r.data),
};

// ── Transfers ───────────────────────────────────────────────
export const transferApi = {
  getAll: (params?: {
    status?: TransferStatus; warehouseId?: number;
    startDate?: string; endDate?: string;
    page?: number; pageSize?: number;
  }) => api.get<PageResponse<Transfer>>('/transfers', { params }).then(r => r.data),
  getById: (id: number) => api.get<Transfer>(`/transfers/${id}`).then(r => r.data),
  create: (data: TransferRequest) => api.post<Transfer>('/transfers', data).then(r => r.data),
  validate: (id: number) => api.post<Transfer>(`/transfers/${id}/validate`).then(r => r.data),
  cancel: (id: number) => api.post<Transfer>(`/transfers/${id}/cancel`).then(r => r.data),
};

// ── Adjustments ─────────────────────────────────────────────
export const adjustmentApi = {
  getAll: (params?: {
    status?: AdjustmentStatus; warehouseId?: number;
    locationId?: number; productId?: number;
    startDate?: string; endDate?: string;
    page?: number; pageSize?: number;
  }) => api.get<PageResponse<StockAdjustment>>('/adjustments', { params }).then(r => r.data),
  getById: (id: number) => api.get<StockAdjustment>(`/adjustments/${id}`).then(r => r.data),
  create: (data: AdjustmentRequest) => api.post<StockAdjustment>('/adjustments', data).then(r => r.data),
  validate: (id: number) => api.post<StockAdjustment>(`/adjustments/${id}/validate`).then(r => r.data),
  cancel: (id: number) => api.post<StockAdjustment>(`/adjustments/${id}/cancel`).then(r => r.data),
};

// ── Stock Ledger ────────────────────────────────────────────
export const ledgerApi = {
  getAll: (params?: {
    productId?: number; warehouseId?: number; locationId?: number;
    movementType?: MovementType;
    startDate?: string; endDate?: string;
    page?: number; pageSize?: number;
  }) => api.get<PageResponse<StockLedgerEntry>>('/stock-ledger', { params }).then(r => r.data),
};

export default api;
