import { FormEvent, useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loanService, CreateLoanCollateralRequest } from "../../services/loan.service";
import { productService, Product } from "../../services/product.service";
import { customerService, Customer, BusinessCustomer } from "../../services/customer.service";
import { getErrorMessage } from "../../utils/errorHandler";

type CustomerType = "individual" | "business";

export const LoanFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Customer type toggle
  const [customerType, setCustomerType] = useState<CustomerType>("individual");

  // Individual customer search
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Business customer search
  const [bizCustomerId, setBizCustomerId] = useState("");
  const [bizSearch, setBizSearch] = useState("");
  const [bizSuggestions, setBizSuggestions] = useState<BusinessCustomer[]>([]);
  const [showBizDropdown, setShowBizDropdown] = useState(false);

  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Loan details
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [requestedAmount, setRequestedAmount] = useState<number | "">("");
  const [interestRate, setInterestRate] = useState<number | "">("");
  const [tenureMonths, setTenureMonths] = useState<number | "">("");

  // Customer facts (for eligibility)
  const [customerIncome, setCustomerIncome] = useState<number | "">("");
  const [customerAge, setCustomerAge] = useState<number | "">("");
  const [customerCreditScore, setCustomerCreditScore] = useState<number | "">("");

  // Collateral
  const [collaterals, setCollaterals] = useState<CreateLoanCollateralRequest[]>([]);
  const [showCollateralForm, setShowCollateralForm] = useState(false);
  const [newCollateral, setNewCollateral] = useState<CreateLoanCollateralRequest>({
    collateralType: "Cash",
    description: "",
    netBookValue: 0,
    recognitionRate: 100,
  });

  // Eligibility
  const [eligibilityResult, setEligibilityResult] = useState<{
    isEligible: boolean;
    reasons: string[];
  } | null>(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const requiresCollateral = selectedProduct?.requiresCollateral ?? false;

  // Derived: the active customer ID for API calls
  const activeCustomerId = customerType === "individual" ? customerId : bizCustomerId;

  // Pre-populate from ?businessCustomerId= query param
  useEffect(() => {
    const bizId = searchParams.get("businessCustomerId");
    if (bizId) {
      setCustomerType("business");
      setBizCustomerId(bizId);
      customerService.findOneBusiness(bizId).then((biz) => {
        setBizSearch(`${biz.company_name} (${biz.customer_number})`);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!requiresCollateral && collaterals.length > 0) {
      setCollaterals([]);
      setShowCollateralForm(false);
    }
  }, [requiresCollateral, collaterals.length]);

  // Individual customer autocomplete
  useEffect(() => {
    if (customerType !== "individual") return;
    const q = customerSearch.trim();
    if (q.length < 2) { setCustomerSuggestions([]); return; }
    const t = window.setTimeout(async () => {
      try {
        setLoadingCustomers(true);
        const rows = await customerService.search(q, 15);
        setCustomerSuggestions(rows);
        setShowCustomerDropdown(true);
      } catch { setCustomerSuggestions([]); }
      finally { setLoadingCustomers(false); }
    }, 350);
    return () => window.clearTimeout(t);
  }, [customerSearch, customerType]);

  // Business customer autocomplete
  useEffect(() => {
    if (customerType !== "business") return;
    const q = bizSearch.trim();
    if (q.length < 2) { setBizSuggestions([]); return; }
    const t = window.setTimeout(async () => {
      try {
        setLoadingCustomers(true);
        const rows = await customerService.searchBusiness(q, 15);
        setBizSuggestions(rows);
        setShowBizDropdown(true);
      } catch { setBizSuggestions([]); }
      finally { setLoadingCustomers(false); }
    }, 350);
    return () => window.clearTimeout(t);
  }, [bizSearch, customerType]);

  const selectIndividual = useCallback((c: Customer) => {
    setCustomerId(c.id);
    setCustomerSearch(`${c.full_name} (${c.customer_number})`);
    setCustomerSuggestions([]);
    setShowCustomerDropdown(false);
    if (c.age != null) setCustomerAge(c.age);
    setEligibilityResult(null);
  }, []);

  const selectBusiness = useCallback((c: BusinessCustomer) => {
    setBizCustomerId(c.id);
    setBizSearch(`${c.company_name} (${c.customer_number})`);
    setBizSuggestions([]);
    setShowBizDropdown(false);
    setEligibilityResult(null);
  }, []);

  const switchType = (t: CustomerType) => {
    setCustomerType(t);
    setCustomerId(""); setCustomerSearch("");
    setBizCustomerId(""); setBizSearch("");
    setEligibilityResult(null);
    setCustomerAge("");
  };

  const loadProductsIfNeeded = async () => {
    if (products.length > 0) return;
    try {
      const data = await productService.findAll(true);
      setProducts(data.filter((p) => p.isActive));
      if (data.length > 0 && !selectedProductId) setSelectedProductId(data[0].id);
    } catch (err: any) { setError(getErrorMessage(err)); }
  };

  const handleRunEligibility = async () => {
    setError(null);
    setEligibilityResult(null);
    if (!activeCustomerId || !selectedProductId || !requestedAmount) {
      setError("Customer, product, and requested amount are required.");
      return;
    }
    try {
      setLoadingEligibility(true);
      await loadProductsIfNeeded();
      const response = await loanService.checkEligibility({
        loanProductId: selectedProductId,
        customerId: activeCustomerId,
        requestedAmount: Number(requestedAmount),
        customerIncome: customerIncome !== "" ? Number(customerIncome) : undefined,
        customerCreditScore: customerCreditScore !== "" ? Number(customerCreditScore) : undefined,
        customerAge: customerAge !== "" ? Number(customerAge) : undefined,
      });
      setEligibilityResult({ isEligible: response.isEligible, reasons: response.reasons });
    } catch (err: any) { setError(getErrorMessage(err)); }
    finally { setLoadingEligibility(false); }
  };

  const handleCreateApplication = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!activeCustomerId || !selectedProductId || !requestedAmount) {
      setError("Customer, product, and requested amount are required.");
      return;
    }
    if (!eligibilityResult || !eligibilityResult.isEligible) {
      setError("Eligibility has not passed. Please run the eligibility check first.");
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
        customerId: activeCustomerId,
        requestedAmount: Number(requestedAmount),
        interestRate: interestRate !== "" ? Number(interestRate) : undefined,
        tenureMonths: tenureMonths !== "" ? Number(tenureMonths) : undefined,
        collaterals: collaterals.length > 0 ? collaterals : undefined,
      });
      navigate(`/loans/${loan.id}`);
    } catch (err: any) { setError(getErrorMessage(err)); }
    finally { setSubmitting(false); }
  };

  const tabBtn = (t: CustomerType) =>
    `px-3 py-1.5 text-xs font-medium rounded-lg transition ${
      customerType === t
        ? "bg-primary-700 text-white"
        : "text-neutral-500 hover:bg-primary-100 hover:text-primary-700"
    }`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">New Loan Application</h1>
        <p className="page-subtitle">Select customer and product, then run eligibility before submitting.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateApplication} className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">

          {/* Customer & Product */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-800">Customer & Product</h2>
              {/* Customer type toggle */}
              <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1">
                <button type="button" className={tabBtn("individual")} onClick={() => switchType("individual")}>
                  Individual
                </button>
                <button type="button" className={tabBtn("business")} onClick={() => switchType("business")}>
                  Business
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 text-xs">
              {/* Individual search */}
              {customerType === "individual" ? (
                <div className="relative">
                  <label className="form-label">Individual Customer</label>
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="Search name, ID, email or phone…"
                    value={customerSearch}
                    onChange={(e) => { setCustomerSearch(e.target.value); setCustomerId(""); }}
                    onFocus={() => { if (customerSuggestions.length > 0) setShowCustomerDropdown(true); }}
                    onBlur={() => window.setTimeout(() => setShowCustomerDropdown(false), 200)}
                    className="form-input"
                  />
                  {loadingCustomers && (
                    <span className="absolute right-2 top-8 text-[10px] text-neutral-400">…</span>
                  )}
                  {showCustomerDropdown && customerSuggestions.length > 0 && (
                    <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-neutral-300 bg-white shadow-lg">
                      {customerSuggestions.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-[11px] hover:bg-primary-50"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectIndividual(c)}
                          >
                            <span className="font-medium text-neutral-800">{c.full_name}</span>
                            <span className="ml-1 text-neutral-400">{c.customer_number} · {c.national_id}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {customerId && (
                    <p className="mt-1 text-[10px] text-neutral-400">ID: {customerId}</p>
                  )}
                </div>
              ) : (
                /* Business search */
                <div className="relative">
                  <label className="form-label">Business Customer</label>
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="Search company name, TIN, phone…"
                    value={bizSearch}
                    onChange={(e) => { setBizSearch(e.target.value); setBizCustomerId(""); }}
                    onFocus={() => { if (bizSuggestions.length > 0) setShowBizDropdown(true); }}
                    onBlur={() => window.setTimeout(() => setShowBizDropdown(false), 200)}
                    className="form-input"
                  />
                  {loadingCustomers && (
                    <span className="absolute right-2 top-8 text-[10px] text-neutral-400">…</span>
                  )}
                  {showBizDropdown && bizSuggestions.length > 0 && (
                    <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-neutral-300 bg-white shadow-lg">
                      {bizSuggestions.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-[11px] hover:bg-primary-50"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectBusiness(c)}
                          >
                            <span className="font-medium text-neutral-800">{c.company_name}</span>
                            <span className="ml-1 text-neutral-400">{c.customer_number} · TIN {c.tin}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {bizCustomerId && (
                    <p className="mt-1 text-[10px] text-neutral-400">ID: {bizCustomerId}</p>
                  )}
                </div>
              )}

              {/* Product */}
              <div>
                <label className="form-label">Loan Product</label>
                <select
                  className="form-select"
                  value={selectedProductId}
                  onFocus={loadProductsIfNeeded}
                  onChange={(e) => { setSelectedProductId(e.target.value); setEligibilityResult(null); }}
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.productCode} – {p.productName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-800">Loan Details</h2>
            <div className="grid gap-3 md:grid-cols-3 text-xs">
              <div>
                <label className="form-label">Requested Amount (RWF)</label>
                <input
                  type="number"
                  min="0"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="form-input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="form-label">Interest Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value === "" ? "" : Number(e.target.value))}
                  className="form-input"
                  placeholder="From product"
                />
              </div>
              <div>
                <label className="form-label">Tenure (months)</label>
                <input
                  type="number"
                  min="1"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(e.target.value === "" ? "" : Number(e.target.value))}
                  className="form-input"
                  placeholder="From product"
                />
              </div>
            </div>
          </div>

          {/* Customer Facts for Eligibility */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-800">
              {customerType === "business" ? "Business Facts" : "Customer Facts"}
            </h2>
            <p className="text-xs text-neutral-400">Used for eligibility scoring only. Leave blank to skip.</p>
            <div className="grid gap-3 md:grid-cols-3 text-xs">
              <div>
                <label className="form-label">
                  {customerType === "business" ? "Monthly Revenue (RWF)" : "Net Monthly Income (RWF)"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={customerIncome}
                  onChange={(e) => setCustomerIncome(e.target.value === "" ? "" : Number(e.target.value))}
                  className="form-input"
                  placeholder="0"
                />
              </div>
              {customerType === "individual" && (
                <div>
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    min="0"
                    value={customerAge}
                    onChange={(e) => setCustomerAge(e.target.value === "" ? "" : Number(e.target.value))}
                    className="form-input"
                    placeholder="Auto-filled on select"
                  />
                </div>
              )}
              <div>
                <label className="form-label">Credit Score</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={customerCreditScore}
                  onChange={(e) => setCustomerCreditScore(e.target.value === "" ? "" : Number(e.target.value))}
                  className="form-input"
                  placeholder="0 – 1000"
                />
              </div>
            </div>
          </div>

          {/* Collateral */}
          {requiresCollateral && (
            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-neutral-800">Collateral</h2>
              <p className="text-xs text-neutral-400">
                Required for this product. Recognized value = Net Book Value × Recognition Rate (BNR Art. 45).
              </p>

              {collaterals.length > 0 && (
                <div className="space-y-2">
                  {collaterals.map((c, idx) => (
                    <div key={`${c.collateralType}-${idx}`} className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs">
                      <div>
                        <span className="font-medium text-neutral-800">{c.collateralType}</span>
                        <span className="ml-2 text-neutral-500">{c.description}</span>
                        <span className="ml-2 text-neutral-600">
                          Recognized: {((c.netBookValue * c.recognitionRate) / 100).toLocaleString('en-RW')} RWF
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCollaterals((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-xs text-danger hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showCollateralForm ? (
                <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="grid gap-3 md:grid-cols-2 text-xs">
                    <div>
                      <label className="form-label">Collateral Type</label>
                      <select
                        value={newCollateral.collateralType}
                        onChange={(e) => setNewCollateral((p) => ({ ...p, collateralType: e.target.value }))}
                        className="form-select"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Securities">Securities</option>
                        <option value="Registered Property">Registered Property</option>
                        <option value="Movable Asset">Movable Asset</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        value={newCollateral.description}
                        onChange={(e) => setNewCollateral((p) => ({ ...p, description: e.target.value }))}
                        className="form-input"
                        placeholder="e.g. Plot 12, Kigali"
                      />
                    </div>
                    <div>
                      <label className="form-label">Net Book Value (RWF)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newCollateral.netBookValue}
                        onChange={(e) => setNewCollateral((p) => ({ ...p, netBookValue: Number(e.target.value) || 0 }))}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Recognition Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={newCollateral.recognitionRate}
                        onChange={(e) => setNewCollateral((p) => ({ ...p, recognitionRate: Number(e.target.value) || 0 }))}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!newCollateral.description.trim()) return;
                        setCollaterals((prev) => [...prev, newCollateral]);
                        setNewCollateral({ collateralType: "Cash", description: "", netBookValue: 0, recognitionRate: 100 });
                        setShowCollateralForm(false);
                      }}
                      className="btn-primary text-xs"
                    >
                      Add Collateral
                    </button>
                    <button type="button" onClick={() => setShowCollateralForm(false)} className="btn-secondary text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCollateralForm(true)}
                  className="w-full rounded-lg border border-dashed border-neutral-300 px-2 py-2 text-xs text-neutral-500 hover:border-primary-700 hover:text-primary-700 transition"
                >
                  + Add Collateral
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar: Eligibility + Submit */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-800">Eligibility Check</h2>
            <p className="text-xs text-neutral-400">
              Run eligibility against the selected product rules before creating the application.
            </p>
            <button
              type="button"
              onClick={handleRunEligibility}
              disabled={loadingEligibility}
              className="btn-secondary w-full justify-center text-xs"
            >
              {loadingEligibility ? "Checking…" : "Run Eligibility Check"}
            </button>

            <div className={`rounded-xl p-3 text-xs ${
              !eligibilityResult
                ? "border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400"
                : eligibilityResult.isEligible
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-rose-200 bg-rose-50 text-rose-700"
            }`}>
              {eligibilityResult ? (
                <div>
                  <div className="mb-1.5 font-semibold">
                    {eligibilityResult.isEligible ? "✓ PASSED" : "✗ FAILED"}
                  </div>
                  {eligibilityResult.reasons.length > 0 && (
                    <ul className="list-disc space-y-0.5 pl-4">
                      {eligibilityResult.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  )}
                </div>
              ) : (
                "Eligibility result will appear here after the check."
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || !eligibilityResult || !eligibilityResult.isEligible}
              className="btn-primary flex-1 justify-center"
            >
              {submitting ? "Creating…" : "Create Application"}
            </button>
            <button type="button" onClick={() => navigate("/loans")} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
          </div>

          {eligibilityResult && !eligibilityResult.isEligible && (
            <p className="text-xs text-rose-600 text-center">Resolve eligibility issues before submitting.</p>
          )}
        </div>
      </form>
    </div>
  );
};
