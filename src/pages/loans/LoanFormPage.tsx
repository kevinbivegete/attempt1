import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService } from '../../services/loan.service';
import { productService, Product } from '../../services/product.service';
import { getErrorMessage } from '../../utils/errorHandler';

export const LoanFormPage = () => {
  const navigate = useNavigate();

  const [customerId, setCustomerId] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [requestedAmount, setRequestedAmount] = useState<number | ''>('');
  const [interestRate, setInterestRate] = useState<number | ''>('');
  const [tenureMonths, setTenureMonths] = useState<number | ''>('');

  const [customerIncome, setCustomerIncome] = useState<number | ''>('');
  const [customerAge, setCustomerAge] = useState<number | ''>('');
  const [customerCreditScore, setCustomerCreditScore] = useState<number | ''>(
    '',
  );

  const [eligibilityResult, setEligibilityResult] = useState<
    | {
        isEligible: boolean;
        reasons: string[];
        summary: string;
      }
    | null
  >(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductsIfNeeded = async () => {
    if (products.length > 0) return;
    try {
      const data = await productService.findAll(true);
      setProducts(data.filter((p) => p.isActive));
      if (data.length > 0 && !selectedProductId) {
        setSelectedProductId(data[0].id);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleRunEligibility = async () => {
    setError(null);
    setEligibilityResult(null);

    if (!customerId || !selectedProductId || !requestedAmount) {
      setError('Customer, product, and requested amount are required.');
      return;
    }

    try {
      setLoadingEligibility(true);
      await loadProductsIfNeeded();

      const response = await loanService.checkEligibility({
        loanProductId: selectedProductId,
        customerId,
        requestedAmount: Number(requestedAmount),
        customerIncome:
          customerIncome !== '' ? Number(customerIncome) : undefined,
        customerCreditScore:
          customerCreditScore !== '' ? Number(customerCreditScore) : undefined,
        customerAge: customerAge !== '' ? Number(customerAge) : undefined,
      });

      setEligibilityResult({
        isEligible: response.isEligible,
        reasons: response.reasons,
        summary: response.isEligible
          ? 'PASSED – Customer meets current product rules.'
          : 'FAILED – One or more eligibility rules were not satisfied.',
      });
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingEligibility(false);
    }
  };

  const handleCreateApplication = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId || !selectedProductId || !requestedAmount) {
      setError('Customer, product, and requested amount are required.');
      return;
    }

    // Require a passing eligibility check before creating the loan application
    if (!eligibilityResult || !eligibilityResult.isEligible) {
      setError(
        'Eligibility has not passed. Please run the eligibility check and ensure it passes before creating the application.',
      );
      return;
    }

    try {
      setSubmitting(true);
      await loadProductsIfNeeded();

      const loan = await loanService.create({
        loanProductId: selectedProductId,
        customerId,
        requestedAmount: Number(requestedAmount),
        interestRate: interestRate !== '' ? Number(interestRate) : undefined,
        tenureMonths: tenureMonths !== '' ? Number(tenureMonths) : undefined,
      });

      navigate(`/loans/${loan.id}`);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            New Loan Application
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Select customer and product, capture application details, and run
            eligibility.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <form
        onSubmit={handleCreateApplication}
        className="grid gap-4 lg:grid-cols-3"
      >
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Customer & Product
            </h2>
            <div className="grid gap-3 md:grid-cols-2 text-xs">
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Customer ID or Name
                </label>
                <input
                  type="text"
                  placeholder="Enter customer ID"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Product
                </label>
                <select
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  value={selectedProductId}
                  onFocus={loadProductsIfNeeded}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.productCode} - {p.productName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Loan Details
            </h2>
            <div className="grid gap-3 md:grid-cols-3 text-xs">
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Requested Amount
                </label>
                <input
                  type="number"
                  value={requestedAmount}
                  onChange={(e) =>
                    setRequestedAmount(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) =>
                    setInterestRate(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Tenure (months)
                </label>
                <input
                  type="number"
                  value={tenureMonths}
                  onChange={(e) =>
                    setTenureMonths(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Customer Facts
            </h2>
            <div className="grid gap-3 md:grid-cols-3 text-xs">
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Net Monthly Income
                </label>
                <input
                  type="number"
                  value={customerIncome}
                  onChange={(e) =>
                    setCustomerIncome(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Age
                </label>
                <input
                  type="number"
                  value={customerAge}
                  onChange={(e) =>
                    setCustomerAge(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Credit Score
                </label>
                <input
                  type="number"
                  value={customerCreditScore}
                  onChange={(e) =>
                    setCustomerCreditScore(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Eligibility Check
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Run `/loans/eligibility-check` before submitting to see pass/fail
              and reasons.
            </p>
            <button
              type="button"
              onClick={handleRunEligibility}
              disabled={loadingEligibility}
              className="w-full rounded-md bg-slate-200 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              {loadingEligibility
                ? 'Checking eligibility...'
                : 'Run Eligibility Check'}
            </button>
            <div
              className={`rounded-md p-2 text-[11px] ${
                !eligibilityResult
                  ? 'border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300'
                  : eligibilityResult.isEligible
                  ? 'border border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100'
                  : 'border border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-100'
              }`}
            >
              {eligibilityResult ? (
                <div>
                  <div className="mb-1 font-semibold">
                    {eligibilityResult.isEligible ? 'PASSED' : 'FAILED'}
                  </div>
                  {eligibilityResult.reasons.length > 0 && (
                    <ul className="list-disc pl-4">
                      {eligibilityResult.reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                'Eligibility result will appear here (e.g. PASSED with reasons).'
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-md bg-primary-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-primary-400 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Application'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/loans')}
              className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
