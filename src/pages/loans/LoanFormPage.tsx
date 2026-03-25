import { FormEvent, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  loanService,
  CreateLoanCollateralRequest,
} from "../../services/loan.service";
import { productService, Product } from "../../services/product.service";
import {
  customerService,
  Customer,
  customerAgeFromDateOfBirth,
} from "../../services/customer.service";
import { getErrorMessage } from "../../utils/errorHandler";

export const LoanFormPage = () => {
  const navigate = useNavigate();

  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>(
    []
  );
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [requestedAmount, setRequestedAmount] = useState<number | "">("");
  const [interestRate, setInterestRate] = useState<number | "">("");
  const [tenureMonths, setTenureMonths] = useState<number | "">("");

  const [customerIncome, setCustomerIncome] = useState<number | "">("");
  const [customerAge, setCustomerAge] = useState<number | "">("");
  const [customerCreditScore, setCustomerCreditScore] = useState<number | "">(
    ""
  );

  const [collaterals, setCollaterals] = useState<CreateLoanCollateralRequest[]>(
    []
  );
  const [showCollateralForm, setShowCollateralForm] = useState(false);
  const [newCollateral, setNewCollateral] =
    useState<CreateLoanCollateralRequest>({
      collateralType: "Cash",
      description: "",
      netBookValue: 0,
      recognitionRate: 100,
    });

  const [eligibilityResult, setEligibilityResult] = useState<{
    isEligible: boolean;
    reasons: string[];
    summary: string;
  } | null>(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const requiresCollateral = selectedProduct?.requiresCollateral ?? false;

  useEffect(() => {
    if (!requiresCollateral && collaterals.length > 0) {
      setCollaterals([]);
      setShowCollateralForm(false);
    }
  }, [requiresCollateral, collaterals.length]);

  useEffect(() => {
    const q = customerSearch.trim();
    if (q.length < 2) {
      setCustomerSuggestions([]);
      return;
    }
    const t = window.setTimeout(async () => {
      try {
        setLoadingCustomers(true);
        const rows = await customerService.search(q, 15);
        setCustomerSuggestions(rows);
        setShowCustomerDropdown(true);
      } catch {
        setCustomerSuggestions([]);
      } finally {
        setLoadingCustomers(false);
      }
    }, 350);
    return () => window.clearTimeout(t);
  }, [customerSearch]);

  const selectCustomer = useCallback((c: Customer) => {
    setCustomerId(c.id);
    setCustomerSearch(
      `${c.firstName} ${c.lastName} (${c.customerNumber})`
    );
    setCustomerSuggestions([]);
    setShowCustomerDropdown(false);
    if (c.monthlyIncome != null) {
      setCustomerIncome(c.monthlyIncome);
    }
    if (c.creditScore != null) {
      setCustomerCreditScore(c.creditScore);
    }
    const age = customerAgeFromDateOfBirth(c.dateOfBirth);
    if (age != null) {
      setCustomerAge(age);
    }
  }, []);

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
      setError("Customer, product, and requested amount are required.");
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
          customerIncome !== "" ? Number(customerIncome) : undefined,
        customerCreditScore:
          customerCreditScore !== "" ? Number(customerCreditScore) : undefined,
        customerAge: customerAge !== "" ? Number(customerAge) : undefined,
      });

      setEligibilityResult({
        isEligible: response.isEligible,
        reasons: response.reasons,
        summary: response.isEligible
          ? "PASSED – Customer meets current product rules."
          : "FAILED – One or more eligibility rules were not satisfied.",
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
      setError("Customer, product, and requested amount are required.");
      return;
    }

    // Require a passing eligibility check before creating the loan application
    if (!eligibilityResult || !eligibilityResult.isEligible) {
      setError(
        "Eligibility has not passed. Please run the eligibility check and ensure it passes before creating the application."
      );
      return;
    }

    if (requiresCollateral && collaterals.length === 0) {
      setError("This product requires collateral. Please add at least one.");
      return;
    }

    try {
      setSubmitting(true);
      await loadProductsIfNeeded();

      const loan = await loanService.create({
        loanProductId: selectedProductId,
        customerId,
        requestedAmount: Number(requestedAmount),
        interestRate: interestRate !== "" ? Number(interestRate) : undefined,
        tenureMonths: tenureMonths !== "" ? Number(tenureMonths) : undefined,
        collaterals: collaterals.length > 0 ? collaterals : undefined,
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
              <div className="relative">
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Customer
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="Search name, email, number, or ID…"
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setCustomerId("");
                  }}
                  onFocus={() => {
                    if (customerSuggestions.length > 0) {
                      setShowCustomerDropdown(true);
                    }
                  }}
                  onBlur={() => {
                    window.setTimeout(() => setShowCustomerDropdown(false), 200);
                  }}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
                />
                {loadingCustomers && (
                  <span className="absolute right-2 top-8 text-[10px] text-slate-400">
                    …
                  </span>
                )}
                {showCustomerDropdown && customerSuggestions.length > 0 && (
                  <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-md">
                    {customerSuggestions.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          className="w-full px-2 py-1.5 text-left text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectCustomer(c)}
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {c.firstName} {c.lastName}
                          </span>
                          <span className="ml-1 text-slate-500">
                            {c.customerNumber} · {c.email}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {customerId && (
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                    Selected ID: {customerId}
                  </p>
                )}
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
                      e.target.value === "" ? "" : Number(e.target.value)
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
                      e.target.value === "" ? "" : Number(e.target.value)
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
                      e.target.value === "" ? "" : Number(e.target.value)
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
                      e.target.value === "" ? "" : Number(e.target.value)
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
                      e.target.value === "" ? "" : Number(e.target.value)
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
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {requiresCollateral && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Collateral
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Required for this product. Recognized value is calculated as Net
                Book Value × Recognition Rate (BNR Article 45).
              </p>
              {collaterals.length > 0 && (
                <div className="space-y-2">
                  {collaterals.map((c, idx) => (
                    <div
                      key={`${c.collateralType}-${idx}`}
                      className="flex items-center justify-between gap-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 px-3 py-2 text-xs"
                    >
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {c.collateralType}
                        </span>
                        <span className="ml-2 text-slate-500 dark:text-slate-400">
                          {c.description}
                        </span>
                        <span className="ml-2 text-slate-600 dark:text-slate-300">
                          Recognized:{" "}
                          {(
                            (c.netBookValue * c.recognitionRate) /
                            100
                          ).toFixed(2)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCollaterals((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-rose-600 dark:text-rose-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showCollateralForm ? (
                <div className="space-y-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 p-3">
                  <div className="grid gap-2 md:grid-cols-2 text-xs">
                    <div>
                      <label className="mb-1 block text-slate-700 dark:text-slate-300">
                        Collateral Type
                      </label>
                      <select
                        value={newCollateral.collateralType}
                        onChange={(e) =>
                          setNewCollateral((p) => ({
                            ...p,
                            collateralType: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Securities">Securities</option>
                        <option value="Registered Property">
                          Registered Property
                        </option>
                        <option value="Movable Asset">Movable Asset</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-slate-700 dark:text-slate-300">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newCollateral.description}
                        onChange={(e) =>
                          setNewCollateral((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                        placeholder="e.g. Plot 12, Kigali"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-slate-700 dark:text-slate-300">
                        Net Book Value
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newCollateral.netBookValue}
                        onChange={(e) =>
                          setNewCollateral((p) => ({
                            ...p,
                            netBookValue: Number(e.target.value) || 0,
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-slate-700 dark:text-slate-300">
                        Recognition Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={newCollateral.recognitionRate}
                        onChange={(e) =>
                          setNewCollateral((p) => ({
                            ...p,
                            recognitionRate: Number(e.target.value) || 0,
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!newCollateral.description.trim()) return;
                        setCollaterals((prev) => [...prev, newCollateral]);
                        setNewCollateral({
                          collateralType: "Cash",
                          description: "",
                          netBookValue: 0,
                          recognitionRate: 100,
                        });
                        setShowCollateralForm(false);
                      }}
                      className="rounded-md bg-primary-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-primary-400"
                    >
                      Add Collateral
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCollateralForm(false)}
                      className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCollateralForm(true)}
                  className="w-full rounded-md border border-dashed border-slate-300 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-300"
                >
                  + Add Collateral
                </button>
              )}
            </div>
          )}
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
                ? "Checking eligibility..."
                : "Run Eligibility Check"}
            </button>
            <div
              className={`rounded-md p-2 text-[11px] ${
                !eligibilityResult
                  ? "border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300"
                  : eligibilityResult.isEligible
                  ? "border border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100"
                  : "border border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-100"
              }`}
            >
              {eligibilityResult ? (
                <div>
                  <div className="mb-1 font-semibold">
                    {eligibilityResult.isEligible ? "PASSED" : "FAILED"}
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
                "Eligibility result will appear here (e.g. PASSED with reasons)."
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={
                submitting ||
                !eligibilityResult ||
                !eligibilityResult.isEligible
              }
              className="flex-1 rounded-md bg-primary-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-primary-400 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Application"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/loans")}
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
