import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, Product } from '../../services/product.service';
import { getErrorMessage } from '../../utils/errorHandler';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(n);

export const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => { if (id) loadProduct(); }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await productService.findOne(id);
      setProduct(data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!id) return;
    try { setActionLoading(true); await productService.activate(id); await loadProduct(); }
    catch (err: any) { alert(getErrorMessage(err)); }
    finally { setActionLoading(false); }
  };

  const handleDeactivate = async () => {
    if (!id) return;
    try { setActionLoading(true); await productService.deactivate(id); await loadProduct(); }
    catch (err: any) { alert(getErrorMessage(err)); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!id) return;
    try { setDeleteLoading(true); await productService.delete(id); navigate('/products'); }
    catch (err: any) { alert(getErrorMessage(err)); }
    finally { setDeleteLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-sm text-neutral-400">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error || 'Product not found'}
        </div>
        <button onClick={() => navigate('/products')} className="btn-secondary">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{product.productName}</h1>
          <p className="page-subtitle">
            Code: {product.productCode} ·{' '}
            <span className={product.isActive ? 'text-success' : 'text-neutral-400'}>
              {product.isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => navigate(`/products/${product.id}/edit`)} className="btn-secondary">
            Edit
          </button>
          {product.isActive ? (
            <button onClick={handleDeactivate} disabled={actionLoading} className="btn-ghost text-amber-600 hover:text-amber-700">
              {actionLoading ? 'Deactivating...' : 'Deactivate'}
            </button>
          ) : (
            <button onClick={handleActivate} disabled={actionLoading} className="btn-ghost text-success">
              {actionLoading ? 'Activating...' : 'Activate'}
            </button>
          )}
          <button onClick={() => setShowDeleteConfirm(true)} disabled={deleteLoading} className="btn-danger">
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Core Info */}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">Core Information</h2>
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              {[
                { label: 'Product Code', value: product.productCode, mono: true },
                { label: 'Product Name', value: product.productName },
                { label: 'Min / Max Amount (RWF)', value: `${fmt(product.minLoanAmount)} – ${fmt(product.maxLoanAmount)}` },
                { label: 'Interest Rate', value: `${product.interestRate}% ${product.interestRateType}` },
                { label: 'Tenure', value: `${product.tenureMonths} months` },
                { label: 'Repayment Schedule', value: product.repaymentScheduleType },
                { label: 'Requires Collateral', value: product.requiresCollateral ? 'Yes' : 'No' },
                ...(product.defaultDisbursementAccount ? [{ label: 'Disbursement Account', value: product.defaultDisbursementAccount }] : []),
                ...(product.defaultGLAccount ? [{ label: 'Default GL Account', value: product.defaultGLAccount }] : []),
              ].map(({ label, value, mono }) => (
                <div key={label}>
                  <dt className="text-xs text-neutral-500 mb-1">{label}</dt>
                  <dd className={`font-medium text-neutral-800 ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
                </div>
              ))}
              {product.description && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-neutral-500 mb-1">Description</dt>
                  <dd className="text-neutral-700">{product.description}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Eligibility Rules */}
          {product.eligibilityRules && product.eligibilityRules.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-3 text-sm font-semibold text-neutral-800">Eligibility Rules</h2>
              <ul className="space-y-2">
                {product.eligibilityRules.map((rule) => (
                  <li key={rule.id} className="flex items-center gap-2 text-sm text-neutral-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-700 flex-shrink-0" />
                    {rule.ruleName}: {rule.ruleType} {rule.operator} {rule.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Fees */}
          {product.fees && product.fees.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-3 text-sm font-semibold text-neutral-800">Fees</h2>
              <ul className="space-y-2">
                {product.fees.map((fee) => (
                  <li key={fee.id} className="flex items-center justify-between text-sm text-neutral-700">
                    <span>{fee.feeName}</span>
                    <span className="font-semibold text-neutral-800">
                      {fee.isPercentage ? `${fee.feePercentage}%` : `${fmt(fee.feeAmount || 0)} RWF`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Approval Workflow */}
          {product.approvalWorkflows && product.approvalWorkflows.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-3 text-sm font-semibold text-neutral-800">Approval Workflow</h2>
              <ul className="space-y-2">
                {product.approvalWorkflows.map((w) => (
                  <li key={w.id} className="text-sm text-neutral-700">
                    <span className="font-medium">{w.approverRole}</span>
                    <span className="text-neutral-500"> · Level {w.approvalLevel}</span>
                    <div className="text-xs text-neutral-500">{fmt(w.minAmount)} – {fmt(w.maxAmount)} RWF</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={async () => { await handleDelete(); setShowDeleteConfirm(false); }}
      />
    </div>
  );
};
