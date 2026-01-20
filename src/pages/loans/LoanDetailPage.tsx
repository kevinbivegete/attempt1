export const LoanDetailPage = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">LOAN-2025-001</h1>
          <p className="mt-1 text-sm text-slate-400">
            Customer CUST-001 • SME Business Loan • Pending Approval
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700">
            Submit for Approval
          </button>
          <button className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-400">
            Approve
          </button>
          <button className="rounded-md bg-rose-500 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-rose-400">
            Reject
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">
              Core Loan Information
            </h2>
            <dl className="grid gap-3 text-xs text-slate-200 sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">Product</dt>
                <dd>SME-001 - SME Business Loan</dd>
              </div>
              <div>
                <dt className="text-slate-400">Requested Amount</dt>
                <dd>50,000</dd>
              </div>
              <div>
                <dt className="text-slate-400">Approved Amount</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt className="text-slate-400">Interest / Tenure</dt>
                <dd>18% • 24 months</dd>
              </div>
              <div>
                <dt className="text-slate-400">Status</dt>
                <dd>
                  <span className="inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                    Pending
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">
              Eligibility Result
            </h2>
            <div className="rounded-md border border-emerald-700/60 bg-emerald-900/30 p-3 text-xs text-emerald-100">
              PASSED – Customer meets income, age, and credit score thresholds.
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">
              Disbursement Summary
            </h2>
            <dl className="grid gap-3 text-xs text-slate-200 sm:grid-cols-3">
              <div>
                <dt className="text-slate-400">Total Approved</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt className="text-slate-400">Total Disbursed</dt>
                <dd>0</dd>
              </div>
              <div>
                <dt className="text-slate-400">Remaining</dt>
                <dd>0</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">
              Approval Info
            </h2>
            <p className="text-xs text-slate-400">
              Once approved, this section will show approver, approved amount,
              and approval timestamp.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">
              Disbursements
            </h2>
            <p className="text-xs text-slate-400">
              After approval, initiate disbursement from here and view
              disbursement history.
            </p>
            <button className="mt-2 w-full rounded-md bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700">
              Initiate Disbursement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
