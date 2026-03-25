import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  productService,
  CreateProductDto,
  CreateProductFeeDto,
  CreateEligibilityRuleDto,
  CreateApprovalWorkflowDto,
} from '../../services/product.service';
import { getErrorMessage, getFieldErrors } from '../../utils/errorHandler';

const STEPS = [
  { id: 1, label: 'Core Details' },
  { id: 2, label: 'Fees & Accounts' },
  { id: 3, label: 'Eligibility Rules' },
  { id: 4, label: 'Approval Workflow' },
] as const;

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
  const [currentStep, setCurrentStep] = useState(1);

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
    defaultDisbursementAccount: '',
    defaultGLAccount: '',
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

  const validateStep1 = (): boolean => {
    const { productCode, productName, minLoanAmount, maxLoanAmount, interestRate, tenureMonths } = formData;
    if (!productCode?.trim()) return false;
    if (!productName?.trim()) return false;
    if (minLoanAmount < 0 || maxLoanAmount < 0) return false;
    if (maxLoanAmount < minLoanAmount) return false;
    if (interestRate < 0 || interestRate > 100) return false;
    if (tenureMonths < 1) return false;
    return true;
  };

  const canProceed = () => {
    if (currentStep === 1) return validateStep1();
    return true;
  };

  const inputClass = (name: string) =>
    `w-full rounded-md border ${
      fieldErrors[name]
        ? 'border-rose-500 dark:border-rose-500'
        : 'border-slate-300 dark:border-slate-800'
    } bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100`;
  const baseInputClass =
    'w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100';
  const labelClass = 'mb-1 block text-slate-700 dark:text-slate-300';
  const cardClass =
    'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3';

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

      {/* Stepper */}
      <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => setCurrentStep(step.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-medium transition-colors ${
                currentStep === step.id
                  ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                  currentStep === step.id
                    ? 'bg-primary-500 text-slate-950'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {step.id}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {idx < STEPS.length - 1 && (
              <div className="h-px w-2 flex-shrink-0 bg-slate-200 dark:bg-slate-700 sm:w-4" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Core Details */}
        {currentStep === 1 && (
          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Core Details
            </h2>
            <div className="grid gap-3 text-xs md:grid-cols-2">
              <div>
                <label className={labelClass}>Product Code *</label>
                <input
                  type="text"
                  name="productCode"
                  value={formData.productCode}
                  onChange={handleChange}
                  required
                  disabled={isEdit}
                  className={inputClass('productCode')}
                />
                {fieldErrors.productCode && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {fieldErrors.productCode}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Product Name *</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                  className={inputClass('productName')}
                />
                {fieldErrors.productName && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {fieldErrors.productName}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className={baseInputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Min Amount *</label>
                <input
                  type="number"
                  name="minLoanAmount"
                  value={formData.minLoanAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className={inputClass('minLoanAmount')}
                />
                {fieldErrors.minLoanAmount && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {fieldErrors.minLoanAmount}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Max Amount *</label>
                <input
                  type="number"
                  name="maxLoanAmount"
                  value={formData.maxLoanAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className={inputClass('maxLoanAmount')}
                />
                {fieldErrors.maxLoanAmount && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {fieldErrors.maxLoanAmount}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Interest Rate (%) *</label>
                <input
                  type="number"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className={inputClass('interestRate')}
                />
                {fieldErrors.interestRate && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {fieldErrors.interestRate}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Interest Type *</label>
                <select
                  name="interestRateType"
                  value={formData.interestRateType}
                  onChange={handleChange}
                  required
                  className={baseInputClass}
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Floating">Floating</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Tenure (months) *</label>
                <input
                  type="number"
                  name="tenureMonths"
                  value={formData.tenureMonths}
                  onChange={handleChange}
                  required
                  min="1"
                  className={inputClass('tenureMonths')}
                />
                {fieldErrors.tenureMonths && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {fieldErrors.tenureMonths}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Repayment Schedule *</label>
                <select
                  name="repaymentScheduleType"
                  value={formData.repaymentScheduleType}
                  onChange={handleChange}
                  required
                  className={baseInputClass}
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
        )}

        {/* Step 2: Fees & Accounts */}
        {currentStep === 2 && (
          <Step2FeesAndAccounts
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            cardClass={cardClass}
            baseInputClass={baseInputClass}
            labelClass={labelClass}
          />
        )}

        {/* Step 3: Eligibility Rules */}
        {currentStep === 3 && (
          <Step3EligibilityRules
            formData={formData}
            setFormData={setFormData}
            cardClass={cardClass}
            baseInputClass={baseInputClass}
            labelClass={labelClass}
          />
        )}

        {/* Step 4: Approval Workflow */}
        {currentStep === 4 && (
          <Step4ApprovalWorkflow
            formData={formData}
            setFormData={setFormData}
            cardClass={cardClass}
            baseInputClass={baseInputClass}
            labelClass={labelClass}
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Previous
              </button>
            ) : null}
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => canProceed() && setCurrentStep((s) => s + 1)}
                disabled={!canProceed()}
                className="rounded-md bg-primary-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-primary-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? 'Saving...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create Product'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

function Step2FeesAndAccounts({
  formData,
  setFormData,
  handleChange,
  cardClass,
  baseInputClass,
  labelClass,
}: {
  formData: CreateProductDto;
  setFormData: React.Dispatch<React.SetStateAction<CreateProductDto>>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  cardClass: string;
  baseInputClass: string;
  labelClass: string;
}) {
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [newFee, setNewFee] = useState<CreateProductFeeDto>({
    feeType: 'Origination',
    feeName: '',
    feeAmount: 0,
    feePercentage: 0,
    isPercentage: false,
  });

  const addFee = () => {
    if (!newFee.feeName?.trim()) return;
    setFormData((prev) => ({
      ...prev,
      fees: [...(prev.fees || []), { ...newFee }],
    }));
    setNewFee({
      feeType: 'Origination',
      feeName: '',
      feeAmount: 0,
      feePercentage: 0,
      isPercentage: false,
    });
    setShowFeeForm(false);
  };

  const removeFee = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      fees: prev.fees?.filter((_, i) => i !== idx) || [],
    }));
  };

  const fees = formData.fees || [];

  return (
    <div className="space-y-4">
      <div className={cardClass}>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Fees Configuration
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Configure origination, processing, and other fees linked to this
          product.
        </p>
        {fees.length > 0 && (
          <div className="space-y-2">
            {fees.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 px-3 py-2 text-xs"
              >
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {f.feeName}
                  </span>
                  <span className="ml-2 text-slate-500 dark:text-slate-400">
                    ({f.feeType})
                  </span>
                  <span className="ml-2 text-slate-600 dark:text-slate-300">
                    {f.isPercentage
                      ? `${f.feePercentage ?? 0}%`
                      : `${f.feeAmount ?? 0}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFee(idx)}
                  className="text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        {showFeeForm ? (
          <div className="space-y-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Fee Type</label>
                <select
                  value={newFee.feeType}
                  onChange={(e) =>
                    setNewFee((p) => ({ ...p, feeType: e.target.value }))
                  }
                  className={baseInputClass}
                >
                  <option value="Origination">Origination</option>
                  <option value="Processing">Processing</option>
                  <option value="Late">Late</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Fee Name *</label>
                <input
                  type="text"
                  value={newFee.feeName}
                  onChange={(e) =>
                    setNewFee((p) => ({ ...p, feeName: e.target.value }))
                  }
                  placeholder="e.g. Origination Fee"
                  className={baseInputClass}
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  id="isPercentage"
                  checked={newFee.isPercentage}
                  onChange={(e) =>
                    setNewFee((p) => ({
                      ...p,
                      isPercentage: e.target.checked,
                    }))
                  }
                  className="h-3 w-3 rounded"
                />
                <label htmlFor="isPercentage" className="text-xs">
                  Percentage of loan amount
                </label>
              </div>
              {newFee.isPercentage ? (
                <div>
                  <label className={labelClass}>Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={newFee.feePercentage ?? 0}
                    onChange={(e) =>
                      setNewFee((p) => ({
                        ...p,
                        feePercentage: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className={baseInputClass}
                  />
                </div>
              ) : (
                <div>
                  <label className={labelClass}>Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newFee.feeAmount ?? 0}
                    onChange={(e) =>
                      setNewFee((p) => ({
                        ...p,
                        feeAmount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className={baseInputClass}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addFee}
                className="rounded-md bg-primary-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-primary-400"
              >
                Add Fee
              </button>
              <button
                type="button"
                onClick={() => setShowFeeForm(false)}
                className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowFeeForm(true)}
            className="w-full rounded-md border border-dashed border-slate-300 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-300"
          >
            + Add Fee
          </button>
        )}
      </div>

      <div className={cardClass}>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Operational Accounts
        </h2>
        <div className="grid gap-3 text-xs md:grid-cols-2">
          <div>
            <label className={labelClass}>Default Disbursement Account</label>
            <input
              type="text"
              name="defaultDisbursementAccount"
              value={formData.defaultDisbursementAccount ?? ''}
              onChange={handleChange}
              className={baseInputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Default GL Account</label>
            <input
              type="text"
              name="defaultGLAccount"
              value={formData.defaultGLAccount ?? ''}
              onChange={handleChange}
              className={baseInputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3EligibilityRules({
  formData,
  setFormData,
  cardClass,
  baseInputClass,
  labelClass,
}: {
  formData: CreateProductDto;
  setFormData: React.Dispatch<React.SetStateAction<CreateProductDto>>;
  cardClass: string;
  baseInputClass: string;
  labelClass: string;
}) {
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [newRule, setNewRule] = useState<CreateEligibilityRuleDto>({
    ruleName: '',
    ruleType: 'Income',
    operator: '>=',
    value: '',
  });

  const addRule = () => {
    if (!newRule.ruleName?.trim() || !newRule.value?.trim()) return;
    setFormData((prev) => ({
      ...prev,
      eligibilityRules: [...(prev.eligibilityRules || []), { ...newRule }],
    }));
    setNewRule({
      ruleName: '',
      ruleType: 'Income',
      operator: '>=',
      value: '',
    });
    setShowRuleForm(false);
  };

  const removeRule = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      eligibilityRules: prev.eligibilityRules?.filter((_, i) => i !== idx) || [],
    }));
  };

  const rules = formData.eligibilityRules || [];

  return (
    <div className={cardClass}>
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Eligibility Rules
      </h2>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Define income, age, and credit score thresholds for this product.
      </p>
      {rules.length > 0 && (
        <div className="space-y-2">
          {rules.map((r, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 px-3 py-2 text-xs"
            >
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {r.ruleName}
                </span>
                <span className="ml-2 text-slate-500 dark:text-slate-400">
                  ({r.ruleType} {r.operator} {r.value})
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeRule(idx)}
                className="text-rose-600 dark:text-rose-400 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      {showRuleForm ? (
        <div className="space-y-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Rule Name *</label>
              <input
                type="text"
                value={newRule.ruleName}
                onChange={(e) =>
                  setNewRule((p) => ({ ...p, ruleName: e.target.value }))
                }
                placeholder="e.g. Min Income"
                className={baseInputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Rule Type</label>
              <select
                value={newRule.ruleType}
                onChange={(e) =>
                  setNewRule((p) => ({ ...p, ruleType: e.target.value }))
                }
                className={baseInputClass}
              >
                <option value="Income">Income</option>
                <option value="Age">Age</option>
                <option value="CreditScore">Credit Score</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Operator</label>
              <select
                value={newRule.operator}
                onChange={(e) =>
                  setNewRule((p) => ({ ...p, operator: e.target.value }))
                }
                className={baseInputClass}
              >
                <option value=">=">≥</option>
                <option value="<=">≤</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value="=">=</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Value *</label>
              <input
                type="text"
                value={newRule.value}
                onChange={(e) =>
                  setNewRule((p) => ({ ...p, value: e.target.value }))
                }
                placeholder="e.g. 50000 or 18"
                className={baseInputClass}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addRule}
              className="rounded-md bg-primary-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-primary-400"
            >
              Add Rule
            </button>
            <button
              type="button"
              onClick={() => setShowRuleForm(false)}
              className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowRuleForm(true)}
          className="w-full rounded-md border border-dashed border-slate-300 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-300"
        >
          + Add Rule
        </button>
      )}
    </div>
  );
}

function Step4ApprovalWorkflow({
  formData,
  setFormData,
  cardClass,
  baseInputClass,
  labelClass,
}: {
  formData: CreateProductDto;
  setFormData: React.Dispatch<React.SetStateAction<CreateProductDto>>;
  cardClass: string;
  baseInputClass: string;
  labelClass: string;
}) {
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState<CreateApprovalWorkflowDto>({
    minAmount: 0,
    maxAmount: 0,
    approvalLevel: 'Level 1',
    approverRole: '',
  });

  const addWorkflow = () => {
    if (!newWorkflow.approverRole?.trim()) return;
    setFormData((prev) => ({
      ...prev,
      approvalWorkflows: [...(prev.approvalWorkflows || []), { ...newWorkflow }],
    }));
    setNewWorkflow({
      minAmount: 0,
      maxAmount: 0,
      approvalLevel: 'Level 1',
      approverRole: '',
    });
    setShowWorkflowForm(false);
  };

  const removeWorkflow = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      approvalWorkflows:
        prev.approvalWorkflows?.filter((_, i) => i !== idx) || [],
    }));
  };

  const workflows = formData.approvalWorkflows || [];

  return (
    <div className={cardClass}>
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Approval Workflow
      </h2>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Configure approval thresholds and roles for this product.
      </p>
      {workflows.length > 0 && (
        <div className="space-y-2">
          {workflows.map((w, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 px-3 py-2 text-xs"
            >
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {w.approvalLevel}
                </span>
                <span className="ml-2 text-slate-500 dark:text-slate-400">
                  {w.minAmount} – {w.maxAmount}
                </span>
                <span className="ml-2 text-slate-600 dark:text-slate-300">
                  → {w.approverRole}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeWorkflow(idx)}
                className="text-rose-600 dark:text-rose-400 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      {showWorkflowForm ? (
        <div className="space-y-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Min Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newWorkflow.minAmount}
                onChange={(e) =>
                  setNewWorkflow((p) => ({
                    ...p,
                    minAmount: parseFloat(e.target.value) || 0,
                  }))
                }
                className={baseInputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Max Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newWorkflow.maxAmount}
                onChange={(e) =>
                  setNewWorkflow((p) => ({
                    ...p,
                    maxAmount: parseFloat(e.target.value) || 0,
                  }))
                }
                className={baseInputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Approval Level</label>
              <select
                value={newWorkflow.approvalLevel}
                onChange={(e) =>
                  setNewWorkflow((p) => ({
                    ...p,
                    approvalLevel: e.target.value,
                  }))
                }
                className={baseInputClass}
              >
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="Level 3">Level 3</option>
                <option value="Level 4">Level 4</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Approver Role *</label>
              <input
                type="text"
                value={newWorkflow.approverRole}
                onChange={(e) =>
                  setNewWorkflow((p) => ({ ...p, approverRole: e.target.value }))
                }
                placeholder="e.g. Branch Manager"
                className={baseInputClass}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addWorkflow}
              className="rounded-md bg-primary-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-primary-400"
            >
              Add Step
            </button>
            <button
              type="button"
              onClick={() => setShowWorkflowForm(false)}
              className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowWorkflowForm(true)}
          className="w-full rounded-md border border-dashed border-slate-300 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-300"
        >
          + Add Step
        </button>
      )}
    </div>
  );
}
