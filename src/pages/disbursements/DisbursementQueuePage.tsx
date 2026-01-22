export const DisbursementQueuePage = () => {
  const disbursements = [
    {
      id: 'DISB-2025-001',
      loanId: 'LOAN-2025-001',
      customer: 'CUST-001',
      channel: 'MoMo',
      amount: '50,000',
      status: 'Pending',
      createdAt: '2025-01-11',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Disbursement Queue
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Monitor pending, processing, failed, and completed disbursements.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-300">
        <select className="rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-slate-900 dark:text-slate-100">
          <option>View: Pending & Processing</option>
          <option>View: Failed</option>
          <option>View: Completed</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">Disbursement #</th>
              <th className="px-4 py-2 font-medium">Loan #</th>
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Channel</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Created</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {disbursements.map((d) => (
              <tr
                key={d.id}
                className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <td className="px-4 py-2 text-slate-900 dark:text-slate-100">
                  {d.id}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                  {d.loanId}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                  {d.customer}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                  {d.channel}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                  {d.amount}
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                  {d.createdAt}
                </td>
                <td className="px-4 py-2 text-right">
                  <a
                    href={`/disbursements/${d.id}`}
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
