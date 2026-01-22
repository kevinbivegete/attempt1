export const LoanListPage = () => {
  const loans = [
    {
      id: 'LOAN-2025-001',
      customerId: 'CUST-001',
      product: 'SME-001',
      amount: '50,000',
      status: 'Pending',
      createdAt: '2025-01-10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Loan Applications
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Capture new applications, monitor status, and route items for
            approval.
          </p>
        </div>
        <a
          href="/loans/new"
          className="rounded-md bg-primary-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-primary-400"
        >
          New Application
        </a>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-300">
        <select className="rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-slate-900 dark:text-slate-100">
          <option>Status: All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
          <option>Disbursed</option>
          <option>Active</option>
        </select>
        <input
          type="text"
          placeholder="Customer ID"
          className="w-36 rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
        />
        <input
          type="text"
          placeholder="Product code"
          className="w-36 rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">Loan #</th>
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Product</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Created</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((l) => (
              <tr
                key={l.id}
                className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <td className="px-4 py-2 text-slate-900 dark:text-slate-100">
                  {l.id}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                  {l.customerId}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                  {l.product}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                  {l.amount}
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                  {l.createdAt}
                </td>
                <td className="px-4 py-2 text-right">
                  <a
                    href={`/loans/${l.id}`}
                    className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
