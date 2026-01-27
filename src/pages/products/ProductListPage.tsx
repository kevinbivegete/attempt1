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
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [statusFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Include inactive products from the backend when we need to display
      // either all products or specifically inactive ones. If we only want
      // active products, we can limit the query to active records.
      const includeInactive = statusFilter !== 'active';
      const data = await productService.findAll(includeInactive);
      setProducts(data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await productService.activate(id);
      await loadProducts(); // Reload list
    } catch (err: any) {
      alert(getErrorMessage(err));
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await productService.deactivate(id);
      await loadProducts(); // Reload list
    } catch (err: any) {
      alert(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productService.delete(id);
      await loadProducts(); // Reload list
    } catch (err: any) {
      alert(getErrorMessage(err));
    }
  };

  // Filter products by search query
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.isActive) ||
      (statusFilter === 'inactive' && !p.isActive);
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Loan Products
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Configure products, fees, eligibility rules, and approval workflows.
          </p>
        </div>
        <button
          onClick={() => navigate('/products/new')}
          className="rounded-md bg-primary-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-primary-400"
        >
          New Product
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-300">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
          }
          className="rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-slate-900 dark:text-slate-100"
        >
          <option value="all">Status: All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <input
          type="text"
          placeholder="Search by code or name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-56 rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Loading products...
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          {filteredProducts.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-600 dark:text-slate-400">
              No products found
            </div>
          ) : (
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Code</th>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Min / Max Amount</th>
                  <th className="px-4 py-2 font-medium">Interest</th>
                  <th className="px-4 py-2 font-medium">Tenure</th>
                  <th className="px-4 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-4 py-2 text-slate-900 dark:text-slate-100">
                      {p.productCode}
                    </td>
                    <td className="px-4 py-2 text-slate-900 dark:text-slate-100">
                      {p.productName}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          p.isActive
                            ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                      {formatCurrency(p.minLoanAmount)} –{' '}
                      {formatCurrency(p.maxLoanAmount)}
                    </td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                      {p.interestRate}%
                    </td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                      {p.tenureMonths} mo
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => navigate(`/products/${p.id}`)}
                        className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                      >
                        View
                      </button>
                      <span className="mx-1 text-slate-400 dark:text-slate-600">
                        •
                      </span>
                      <button
                        onClick={() => navigate(`/products/${p.id}/edit`)}
                        className="text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-50"
                      >
                        Edit
                      </button>
                      <span className="mx-1 text-slate-400 dark:text-slate-600">
                        •
                      </span>
                      <button
                        onClick={() => setDeleteProductId(p.id)}
                        className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-500"
                      >
                        Delete
                      </button>
                      <span className="mx-1 text-slate-400 dark:text-slate-600">
                        •
                      </span>
                      {p.isActive ? (
                        <button
                          onClick={() => handleDeactivate(p.id)}
                          className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-500"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(p.id)}
                          className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
                        >
                          Activate
                        </button>
                      )}
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
        message={`Are you sure you want to delete this product? This action cannot be undone.`}
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
