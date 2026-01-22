export const ApprovalWorkbenchPage = () => {
  const queue = [
    {
      id: 'LOAN-2025-002',
      customer: 'CUST-002',
      product: 'SME-001',
      requested: '120,000',
      status: 'Pending',
      submittedAt: '2025-01-12',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Approval Workbench
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Loans awaiting approval according to product approval workflows.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">Loan #</th>
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Product</th>
              <th className="px-4 py-2 font-medium">Requested</th>
              <th className="px-4 py-2 font-medium">Submitted</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((l) => (
              <tr
                key={l.id}
                className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <td className="px-4 py-2 text-slate-900 dark:text-slate-100">
                  {l.id}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                  {l.customer}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                  {l.product}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                  {l.requested}
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                  {l.submittedAt}
                </td>
                <td className="px-4 py-2 text-right">
                  <button className="rounded-md bg-emerald-500 px-2 py-1 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400">
                    Quick Approve
                  </button>
                  <button className="ml-2 rounded-md bg-rose-500 px-2 py-1 text-[11px] font-semibold text-slate-950 hover:bg-rose-400">
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
