import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, Product } from '../../services/product.service';
import { getErrorMessage } from '../../utils/errorHandler';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

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
    try {
      setActionLoading(true);
      await productService.activate(id);
      await loadProduct();
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await productService.deactivate(id);
      await loadProduct();
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleteLoading(true);
      await productService.delete(id);
      navigate('/products');
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Loading product...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          {error || 'Product not found'}
        </div>
        <button
          onClick={() => navigate('/products')}
          className="rounded-md bg-primary-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-primary-400"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {product.productName}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Product {product.productCode} •{' '}
            {product.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/products/${product.id}/edit`)}
            className="rounded-md bg-primary-500 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-primary-400"
          >
            Edit Product
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteLoading}
            className="rounded-md border border-rose-300 dark:border-rose-700 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-50"
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
          {product.isActive ? (
            <button
              onClick={handleDeactivate}
              disabled={actionLoading}
              className="rounded-md border border-amber-300 dark:border-amber-700 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50"
            >
              {actionLoading ? 'Deactivating...' : 'Deactivate'}
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={actionLoading}
              className="rounded-md border border-emerald-300 dark:border-emerald-700 px-3 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50"
            >
              {actionLoading ? 'Activating...' : 'Activate'}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Core Information
            </h2>
            <dl className="grid gap-3 text-xs text-slate-700 dark:text-slate-200 sm:grid-cols-2">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">
                  Product Code
                </dt>
                <dd className="font-medium">{product.productCode}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Name</dt>
                <dd className="font-medium">{product.productName}</dd>
              </div>
              {product.description && (
                <div className="sm:col-span-2">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Description
                  </dt>
                  <dd className="mt-1">{product.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500 dark:text-slate-400">
                  Min / Max Amount
                </dt>
                <dd className="font-medium">
                  {formatCurrency(product.minLoanAmount)} –{' '}
                  {formatCurrency(product.maxLoanAmount)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">
                  Interest Rate
                </dt>
                <dd className="font-medium">
                  {product.interestRate}% {product.interestRateType}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Tenure</dt>
                <dd className="font-medium">{product.tenureMonths} months</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">
                  Repayment Schedule
                </dt>
                <dd className="font-medium">{product.repaymentScheduleType}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">
                  Requires Collateral
                </dt>
                <dd className="font-medium">
                  {product.requiresCollateral ? 'Yes' : 'No'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Status</dt>
                <dd>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      product.isActive
                        ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              {product.defaultDisbursementAccount && (
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    Default Disbursement Account
                  </dt>
                  <dd className="font-medium">
                    {product.defaultDisbursementAccount}
                  </dd>
                </div>
              )}
              {product.defaultGLAccount && (
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    Default GL Account
                  </dt>
                  <dd className="font-medium">{product.defaultGLAccount}</dd>
                </div>
              )}
            </dl>
          </div>

          {product.eligibilityRules && product.eligibilityRules.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Eligibility Rules
              </h2>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                {product.eligibilityRules.map((rule) => (
                  <li key={rule.id}>
                    • {rule.ruleName}: {rule.ruleType} {rule.operator}{' '}
                    {rule.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {product.fees && product.fees.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
              <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Fees
              </h2>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                {product.fees.map((fee) => (
                  <li key={fee.id}>
                    <div className="flex items-center justify-between">
                      <span>{fee.feeName}</span>
                      <span className="font-medium">
                        {fee.isPercentage
                          ? `${fee.feePercentage}%`
                          : formatCurrency(fee.feeAmount || 0)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.approvalWorkflows &&
            product.approvalWorkflows.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
                <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Approval Workflow
                </h2>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                  {product.approvalWorkflows.map((workflow) => (
                    <li key={workflow.id}>
                      • {workflow.approverRole}:{' '}
                      {formatCurrency(workflow.minAmount)} –{' '}
                      {formatCurrency(workflow.maxAmount)} (Level{' '}
                      {workflow.approvalLevel})
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
        onConfirm={async () => {
          await handleDelete();
          setShowDeleteConfirm(false);
        }}
      />
    </div>
  );
};
