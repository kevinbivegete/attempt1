export const LoanFormPage = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">
            New Loan Application
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Select customer and product, capture application details, and run
            eligibility.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Customer & Product
            </h2>
            <div className="grid gap-3 md:grid-cols-2 text-xs">
              <div>
                <label className="mb-1 block text-slate-300">
                  Customer ID or Name
                </label>
                <input
                  type="text"
                  placeholder="Search customer"
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-300">Product</label>
                <select className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-100">
                  <option>SME-001 - SME Business Loan</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Loan Details
            </h2>
            <div className="grid gap-3 md:grid-cols-3 text-xs">
              <div>
                <label className="mb-1 block text-slate-300">
                  Requested Amount
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-300">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-300">
                  Tenure (months)
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Customer Facts
            </h2>
            <div className="grid gap-3 md:grid-cols-3 text-xs">
              <div>
                <label className="mb-1 block text-slate-300">
                  Net Monthly Income
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-300">Age</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-300">
                  Credit Score
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Eligibility Check
            </h2>
            <p className="text-xs text-slate-400">
              Run `/loans/eligibility-check` before submitting to see pass/fail
              and reasons.
            </p>
            <button className="w-full rounded-md bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700">
              Run Eligibility Check
            </button>
            <div className="rounded-md border border-dashed border-slate-700 bg-slate-950/60 p-2 text-[11px] text-slate-300">
              Eligibility result will appear here (e.g. PASSED with reasons).
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="flex-1 rounded-md bg-primary-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-primary-400">
              Create Application
            </button>
            <button className="flex-1 rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
