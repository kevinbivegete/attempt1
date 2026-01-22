export const DisbursementFormPage = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Initiate Disbursement
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Pre-filled with approved loan details. Capture channel and recipient
            information.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Loan Summary
            </h2>
            <dl className="grid gap-3 text-xs text-slate-700 dark:text-slate-200 sm:grid-cols-2">
              <div>
                <dt className="text-slate-600 dark:text-slate-400">Loan #</dt>
                <dd className="font-medium">LOAN-2025-001</dd>
              </div>
              <div>
                <dt className="text-slate-600 dark:text-slate-400">
                  Approved Amount
                </dt>
                <dd className="font-medium">50,000</dd>
              </div>
              <div>
                <dt className="text-slate-600 dark:text-slate-400">
                  Total Disbursed
                </dt>
                <dd className="font-medium">0</dd>
              </div>
              <div>
                <dt className="text-slate-600 dark:text-slate-400">
                  Remaining
                </dt>
                <dd className="font-medium">50,000</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Disbursement Details
            </h2>
            <div className="grid gap-3 md:grid-cols-2 text-xs">
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Amount
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Channel
                </label>
                <select className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100">
                  <option>MoMo</option>
                  <option>Bank</option>
                  <option>Cash</option>
                  <option>Cheque</option>
                  <option>Supplier</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Recipient Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Recipient Account / Wallet
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Confirmation
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              On save, this will call{' '}
              <code className="text-[11px] text-primary-600 dark:text-primary-300">
                POST /disbursements
              </code>{' '}
              and move this item into the disbursement queue.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button className="flex-1 rounded-md bg-primary-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-primary-400">
              Create Disbursement
            </button>
            <button className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
