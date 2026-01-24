import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  productService,
  CreateProductDto,
} from '../../services/product.service';
import { getErrorMessage, getFieldErrors } from '../../utils/errorHandler';

type ProductFormPageProps = {
  mode: 'create' | 'edit';
};

export const ProductFormPage = ({ mode }: ProductFormPageProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === 'edit';
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateProductDto>({
    productCode: '',
    productName: '',
    description: '',
    minLoanAmount: 0,
    maxLoanAmount: 0,
    interestRate: 0,
    interestRateType: 'Fixed',
    tenureMonths: 0,
    repaymentScheduleType: 'Monthly',
    requiresCollateral: false,
    fees: [],
    eligibilityRules: [],
    approvalWorkflows: [],
  });

  useEffect(() => {
    if (isEdit && id) {
      loadProduct();
    }
  }, [isEdit, id]);

  const loadProduct = async () => {
    if (!id) return;
    try {
      setLoadingData(true);
      const product = await productService.findOne(id);
      setFormData({
        productCode: product.productCode,
        productName: product.productName,
        description: product.description || '',
        minLoanAmount: product.minLoanAmount,
        maxLoanAmount: product.maxLoanAmount,
        interestRate: product.interestRate,
        interestRateType: product.interestRateType,
        tenureMonths: product.tenureMonths,
        repaymentScheduleType: product.repaymentScheduleType,
        requiresCollateral: product.requiresCollateral,
        autoWriteoffLimit: product.autoWriteoffLimit,
        refundAcceptanceLimit: product.refundAcceptanceLimit,
        defaultDisbursementAccount: product.defaultDisbursementAccount || '',
        defaultGLAccount: product.defaultGLAccount || '',
        fees:
          product.fees?.map((f) => ({
            feeType: f.feeType,
            feeName: f.feeName,
            feeAmount: f.feeAmount,
            feePercentage: f.feePercentage,
            isPercentage: f.isPercentage,
          })) || [],
        eligibilityRules:
          product.eligibilityRules?.map((r) => ({
            ruleName: r.ruleName,
            ruleType: r.ruleType,
            operator: r.operator,
            value: r.value,
          })) || [],
        approvalWorkflows:
          product.approvalWorkflows?.map((w) => ({
            minAmount: w.minAmount,
            maxAmount: w.maxAmount,
            approvalLevel: w.approvalLevel,
            approverRole: w.approverRole,
          })) || [],
      });
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      if (isEdit && id) {
        await productService.update(id, formData);
      } else {
        await productService.create(formData);
      }
      navigate('/products');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      const fieldErrs = getFieldErrors(err);
      if (Object.keys(fieldErrs).length > 0) {
        setFieldErrors(fieldErrs);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? parseFloat(value) || 0
            : value,
    }));
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Loading product...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {isEdit ? 'Edit Product' : 'Create Product'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Define core product parameters, fees, eligibility rules, and
            approval workflow.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Core Details
              </h2>
              <div className="grid gap-3 md:grid-cols-2 text-xs">
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">
                    Product Code *
                  </label>
                  <input
                    type="text"
                    name="productCode"
                    value={formData.productCode}
                    onChange={handleChange}
                    required
                    disabled={isEdit}
                    className={`w-full rounded-md border ${
                      fieldErrors.productCode
                        ? 'border-rose-500 dark:border-rose-500'
                        : 'border-slate-300 dark:border-slate-800'
                    } bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 disabled:opacity-50`}
                  />
                  {fieldErrors.productCode && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {fieldErrors.productCode}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    required
                    className={`w-full rounded-md border ${
                      fieldErrors.productName
                        ? 'border-rose-500 dark:border-rose-500'
                        : 'border-slate-300 dark:border-slate-800'
                    } bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100`}
                  />
                  {fieldErrors.productName && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {fieldErrors.productName}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">
                    Min Amount *
                  </label>
                  <input
                    type="number"
                    name="minLoanAmount"
                    value={formData.minLoanAmount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className={`w-full rounded-md border ${
                      fieldErrors.minLoanAmount
                        ? 'border-rose-500 dark:border-rose-500'
                        : 'border-slate-300 dark:border-slate-800'
                    } bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100`}
                  />
                  {fieldErrors.minLoanAmount && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {fieldErrors.minLoanAmount}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">
                    Max Amount *
                  </label>
                  <input
                    type="number"
                    name="maxLoanAmount"
                    value={formData.maxLoanAmount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className={`w-full rounded-md border ${
                      fieldErrors.maxLoanAmount
                        ? 'border-rose-500 dark:border-rose-500'
                        : 'border-slate-300 dark:border-slate-800'
                    } bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100`}
                  />
                  {fieldErrors.maxLoanAmount && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {fieldErrors.maxLoanAmount}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">
                    Interest Rate (%) *
                  </label>
                  <input
                    type="number"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    className={`w-full rounded-md border ${
                      fieldErrors.interestRate
                        ? 'border-rose-500 dark:border-rose-500'
                        : 'border-slate-300 dark:border-slate-800'
                    } bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100`}
                  />
                  {fieldErrors.interestRate && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {fieldErrors.interestRate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">
                    Interest Type *
                  </label>
                  <select
                    name="interestRateType"
                    value={formData.interestRateType}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Floating">Floating</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">
                    Tenure (months) *
                  </label>
                  <input
                    type="number"
                    name="tenureMonths"
                    value={formData.tenureMonths}
                    onChange={handleChange}
                    required
                    min="1"
                    className={`w-full rounded-md border ${
                      fieldErrors.tenureMonths
                        ? 'border-rose-500 dark:border-rose-500'
                        : 'border-slate-300 dark:border-slate-800'
                    } bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100`}
                  />
                  {fieldErrors.tenureMonths && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {fieldErrors.tenureMonths}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">
                    Repayment Schedule *
                  </label>
                  <select
                    name="repaymentScheduleType"
                    value={formData.repaymentScheduleType}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    id="requiresCollateral"
                    type="checkbox"
                    name="requiresCollateral"
                    checked={formData.requiresCollateral}
                    onChange={handleChange}
                    className="h-3 w-3 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                  <label
                    htmlFor="requiresCollateral"
                    className="text-xs text-slate-700 dark:text-slate-200"
                  >
                    Requires collateral
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Operational Accounts
              </h2>
              <div className="grid gap-3 md:grid-cols-2 text-xs">
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">
                    Default Disbursement Account
                  </label>
                  <input
                    type="text"
                    name="defaultDisbursementAccount"
                    value={formData.defaultDisbursementAccount}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">
                    Default GL Account
                  </label>
                  <input
                    type="text"
                    name="defaultGLAccount"
                    value={formData.defaultGLAccount}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Fees Configuration
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Configure origination, processing, and other fees linked to this
                product.
              </p>
              <button
                type="button"
                className="mt-1 w-full rounded-md border border-dashed border-slate-300 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-300"
              >
                + Add Fee
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Eligibility Rules
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Define income, age, and credit score thresholds as
                product_eligibility_rule.
              </p>
              <button
                type="button"
                className="mt-1 w-full rounded-md border border-dashed border-slate-300 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-300"
              >
                + Add Rule
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Approval Workflow
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Configure approval thresholds and roles for
                product_approval_workflow.
              </p>
              <button
                type="button"
                className="mt-1 w-full rounded-md border border-dashed border-slate-300 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-300"
              >
                + Add Step
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-md bg-primary-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Saving...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
