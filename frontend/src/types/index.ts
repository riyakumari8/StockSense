// ============================================================
// StockSense Type Definitions — Member 4 Module
// ============================================================

export type WarehouseStatus = 'ACTIVE' | 'INACTIVE';
export type LocationStatus = 'ACTIVE' | 'INACTIVE';
export type TransferStatus = 'DRAFT' | 'READY' | 'DONE' | 'CANCELLED';
export type AdjustmentStatus = 'DRAFT' | 'DONE' | 'CANCELLED';
export type MovementType = 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT';

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  status: WarehouseStatus;
  locationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: number;
  name: string;
  code: string;
  warehouseId: number;
  warehouseName: string;
  warehouseCode: string;
  status: LocationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit: string;
}

export interface Stock {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  locationId: number;
  locationName: string;
  locationCode: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
}

export interface Transfer {
  id: number;
  referenceNumber: string;
  productId: number;
  productName: string;
  productSku: string;
  sourceWarehouseId: number;
  sourceWarehouseName: string;
  sourceLocationId: number;
  sourceLocationName: string;
  destinationWarehouseId: number;
  destinationWarehouseName: string;
  destinationLocationId: number;
  destinationLocationName: string;
  quantity: number;
  status: TransferStatus;
  remarks: string;
  createdBy: string;
  createdAt: string;
  validatedBy: string;
  validatedAt: string;
}

export interface StockAdjustment {
  id: number;
  referenceNumber: string;
  productId: number;
  productName: string;
  productSku: string;
  warehouseId: number;
  warehouseName: string;
  locationId: number;
  locationName: string;
  systemQuantity: number;
  physicalQuantity: number;
  difference: number;
  reason: string;
  status: AdjustmentStatus;
  createdBy: string;
  createdAt: string;
  approvedBy: string;
  approvedAt: string;
}

export interface StockLedgerEntry {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  warehouseId: number;
  warehouseName: string;
  sourceLocationId: number | null;
  sourceLocationName: string | null;
  destinationLocationId: number | null;
  destinationLocationName: string | null;
  movementType: MovementType;
  referenceType: string;
  referenceId: number;
  quantity: number;
  previousQuantity: number;
  resultingQuantity: number;
  performedBy: string;
  createdAt: string;
  remarks: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface WarehouseRequest {
  name: string;
  code: string;
  address: string;
  status: WarehouseStatus;
}

export interface LocationRequest {
  name: string;
  code: string;
  warehouseId: number;
  status: LocationStatus;
}

export interface TransferRequest {
  productId: number;
  sourceWarehouseId: number;
  sourceLocationId: number;
  destinationWarehouseId: number;
  destinationLocationId: number;
  quantity: number;
  remarks: string;
}

export interface AdjustmentRequest {
  productId: number;
  warehouseId: number;
  locationId: number;
  physicalQuantity: number;
  reason: string;
}
