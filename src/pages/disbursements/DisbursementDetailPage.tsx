export const DisbursementDetailPage = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">DISB-2025-001</h1>
          <p className="mt-1 text-sm text-slate-400">
            Loan LOAN-2025-001 • Customer CUST-001 • MoMo • Pending
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700">
            Retry Disbursement
          </button>
          <button className="rounded-md bg-rose-500 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-rose-400">
            Reverse Disbursement
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">
              Disbursement Details
            </h2>
            <dl className="grid gap-3 text-xs text-slate-200 sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">Disbursement #</dt>
                <dd>DISB-2025-001</dd>
              </div>
              <div>
                <dt className="text-slate-400">Loan #</dt>
                <dd>LOAN-2025-001</dd>
              </div>
              <div>
                <dt className="text-slate-400">Amount</dt>
                <dd>50,000</dd>
              </div>
              <div>
                <dt className="text-slate-400">Channel</dt>
                <dd>MoMo</dd>
              </div>
              <div>
                <dt className="text-slate-400">Recipient Name</dt>
                <dd>John Doe</dd>
              </div>
              <div>
                <dt className="text-slate-400">Recipient Account</dt>
                <dd>2567••••••••</dd>
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
              Timestamps
            </h2>
            <dl className="grid gap-3 text-xs text-slate-200 sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">Created At</dt>
                <dd>2025-01-11 10:15</dd>
              </div>
              <div>
                <dt className="text-slate-400">Disbursed At</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt className="text-slate-400">Completed At</dt>
                <dd>—</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">
              Transaction Info
            </h2>
            <dl className="space-y-2 text-xs text-slate-200">
              <div>
                <dt className="text-slate-400">Transaction ID</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt className="text-slate-400">Failure Reason</dt>
                <dd>—</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">
              History
            </h2>
            <p className="text-xs text-slate-400">
              Future extension: show retries and reversals for this
              disbursement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
