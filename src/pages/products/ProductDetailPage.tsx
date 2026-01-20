export const ProductDetailPage = () => {
  // For now this is a static layout; later, fetch by product id from the API
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">
            SME Business Loan
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Product SME-001 • Active • Linked loans: 32
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/products/1/edit"
            className="rounded-md bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700"
          >
            Edit Product
          </a>
          <button className="rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-amber-300 hover:bg-slate-800">
            Deactivate
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">
              Core Information
            </h2>
            <dl className="grid gap-3 text-xs text-slate-200 sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">Product Code</dt>
                <dd>SME-001</dd>
              </div>
              <div>
                <dt className="text-slate-400">Name</dt>
                <dd>SME Business Loan</dd>
              </div>
              <div>
                <dt className="text-slate-400">Min / Max Amount</dt>
                <dd>5,000 – 500,000</dd>
              </div>
              <div>
                <dt className="text-slate-400">Interest Rate</dt>
                <dd>18% Flat</dd>
              </div>
              <div>
                <dt className="text-slate-400">Tenure</dt>
                <dd>6–36 months</dd>
              </div>
              <div>
                <dt className="text-slate-400">Repayment Schedule</dt>
                <dd>Monthly</dd>
              </div>
              <div>
                <dt className="text-slate-400">Requires Collateral</dt>
                <dd>Yes</dd>
              </div>
              <div>
                <dt className="text-slate-400">Status</dt>
                <dd>
                  <span className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                    Active
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">
              Eligibility Rules
            </h2>
            <ul className="space-y-2 text-xs text-slate-200">
              <li>• Minimum age 21, maximum age 65 at end of tenure.</li>
              <li>• Net monthly income ≥ 2x monthly installment.</li>
              <li>• Credit score &gt;= 650 and no active write-offs.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">Fees</h2>
            <ul className="space-y-2 text-xs text-slate-200">
              <li>
                <div className="flex items-center justify-between">
                  <span>Origination Fee</span>
                  <span>2.0% (upfront)</span>
                </div>
              </li>
              <li>
                <div className="flex items-center justify-between">
                  <span>Processing Fee</span>
                  <span>Flat 50,000</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">
              Approval Workflow
            </h2>
            <ul className="space-y-2 text-xs text-slate-200">
              <li>• Loan Officer up to 10,000.</li>
              <li>• Branch Manager up to 100,000.</li>
              <li>• Credit Committee above 100,000.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">
              Linked Loans
            </h2>
            <p className="text-xs text-slate-400">
              32 active / 48 total loans using this product.
            </p>
            <button className="mt-2 w-full rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800">
              View Loans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
