import { useState, useEffect } from 'react';
import { BookOpen, Search, Filter } from 'lucide-react';
import { ledgerApi, productApi } from '../services/api';
import type { StockLedgerEntry, Product } from '../types';
import { useToast } from './ToastProvider';

export function StockLedger() {
  const [entries, setEntries] = useState<StockLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Filters
  const [productId, setProductId] = useState<number | ''>('');
  const [movementType, setMovementType] = useState<string>('');
  
  const { showToast } = useToast();

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (productId) params.productId = productId;
      if (movementType) params.movementType = movementType;
      
      const data = await ledgerApi.getAll(params);
      setEntries(data.content);
    } catch (err: any) {
      showToast('error', 'Failed to load ledger', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    productApi.getAll().then(setProducts);
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [productId, movementType]);

  return (
    <div className="flex flex-col h-full">
      <div className="page-header">
        <h1>Stock Ledger</h1>
        <p>Immutable audit trail of all inventory movements across the system.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 max-w-xs relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <select 
            className="input-field pl-10"
            value={movementType}
            onChange={e => setMovementType(e.target.value)}
          >
            <option value="">All Movement Types</option>
            <option value="RECEIPT">Receipts</option>
            <option value="DELIVERY">Deliveries</option>
            <option value="TRANSFER">Transfers</option>
            <option value="ADJUSTMENT">Adjustments</option>
          </select>
        </div>

        <div className="flex-1 max-w-xs relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <select 
            className="input-field pl-10"
            value={productId}
            onChange={e => setProductId(Number(e.target.value) || '')}
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="empty-state m-auto">
            <BookOpen size={48} className="text-[var(--color-text-muted)] mb-4" />
            <h3>No Ledger Entries Found</h3>
            <p>Stock movements will automatically appear here once recorded.</p>
          </div>
        ) : (
          <div className="table-container flex-1 overflow-auto">
            <table className="data-table relative w-full">
              <thead className="sticky top-0 bg-[var(--color-surface-card)] z-10 shadow-sm">
                <tr>
                  <th>Timestamp</th>
                  <th>Type / Ref</th>
                  <th>Product</th>
                  <th>Location Change</th>
                  <th className="text-right">Qty Change</th>
                  <th className="text-right">Result Qty</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id}>
                    <td className="text-[var(--color-text-secondary)] whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge badge-${entry.movementType.toLowerCase()} mb-1 block w-max`}>
                        {entry.movementType}
                      </span>
                      <span className="text-xs font-mono text-[var(--color-text-muted)]">
                        {entry.referenceType} #{entry.referenceId}
                      </span>
                    </td>
                    <td>
                      <div className="font-medium">{entry.productName}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{entry.productSku}</div>
                    </td>
                    <td>
                      <div className="text-sm">
                        {entry.sourceLocationName ? (
                          <span className="text-[var(--color-danger)]">From {entry.sourceLocationName}</span>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">External</span>
                        )}
                      </div>
                      <div className="text-sm mt-0.5">
                        {entry.destinationLocationName ? (
                          <span className="text-[var(--color-success)]">To {entry.destinationLocationName}</span>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">External</span>
                        )}
                      </div>
                    </td>
                    <td className={`text-right font-medium font-mono ${
                      entry.quantity > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                    }`}>
                      {entry.quantity > 0 ? '+' : ''}{entry.quantity}
                    </td>
                    <td className="text-right font-medium font-mono">
                      {entry.resultingQuantity}
                    </td>
                    <td className="text-sm text-[var(--color-text-secondary)]">
                      {entry.performedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
