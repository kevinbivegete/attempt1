import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, Product } from '../../services/product.service';
import { getErrorMessage } from '../../utils/errorHandler';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const ProductListPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  useEffect(() => { loadProducts(); }, [statusFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.findAll(statusFilter !== 'active');
      setProducts(data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: string) => {
    try { await productService.activate(id); await loadProducts(); } catch (err: any) { alert(getErrorMessage(err)); }
  };
  const handleDeactivate = async (id: string) => {
    try { await productService.deactivate(id); await loadProducts(); } catch (err: any) { alert(getErrorMessage(err)); }
  };
  const handleDelete = async (id: string) => {
    try { await productService.delete(id); await loadProducts(); } catch (err: any) { alert(getErrorMessage(err)); }
  };

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.productCode.toLowerCase().includes(q) || p.productName.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' && p.isActive) || (statusFilter === 'inactive' && !p.isActive);
    return matchSearch && matchStatus;
  });

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Loan Products</h1>
          <p className="page-subtitle">Configure products, fees, eligibility rules & approval workflows.</p>
        </div>
        <button onClick={() => navigate('/products/new')} className="btn-primary">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="form-select w-36"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <input
          type="text"
          placeholder="Search by code or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input w-64"
        />
        <span className="text-xs text-neutral-400">{filtered.length} products</span>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-sm text-neutral-400">Loading products...</div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-neutral-400">No products found</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Product Name</th>
                  <th>Status</th>
                  <th>Min / Max Amount (RWF)</th>
                  <th>Interest</th>
                  <th>Tenure</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs text-neutral-500">{p.productCode}</td>
                    <td className="font-medium text-neutral-800">{p.productName}</td>
                    <td>
                      <span className={p.isActive ? 'badge-success badge' : 'badge-neutral badge'}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{fmt(p.minLoanAmount)} – {fmt(p.maxLoanAmount)}</td>
                    <td>{p.interestRate}%</td>
                    <td>{p.tenureMonths} mo</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/products/${p.id}`)} className="text-xs font-medium text-primary-700 hover:underline">View</button>
                        <span className="text-neutral-300">|</span>
                        <button onClick={() => navigate(`/products/${p.id}/edit`)} className="text-xs font-medium text-neutral-600 hover:text-neutral-800">Edit</button>
                        <span className="text-neutral-300">|</span>
                        {p.isActive
                          ? <button onClick={() => handleDeactivate(p.id)} className="text-xs font-medium text-amber-600 hover:text-amber-700">Deactivate</button>
                          : <button onClick={() => handleActivate(p.id)} className="text-xs font-medium text-success hover:opacity-80">Activate</button>
                        }
                        <span className="text-neutral-300">|</span>
                        <button onClick={() => setDeleteProductId(p.id)} className="text-xs font-medium text-danger hover:opacity-80">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteProductId}
        title="Delete product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setDeleteProductId(null)}
        onConfirm={async () => {
          if (!deleteProductId) return;
          await handleDelete(deleteProductId);
          setDeleteProductId(null);
        }}
      />
    </div>
  );
};
