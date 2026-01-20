export const DashboardPage = () => {
  // Placeholder stats; wire up to real APIs later
  const stats = [
    { label: 'Active Products', value: 8 },
    { label: 'Pending Applications', value: 24 },
    { label: 'Approved, Not Disbursed', value: 11 },
    { label: 'Recent Disbursements (7d)', value: 37 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          High-level overview of loan products, applications, approvals, and
          disbursements.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 shadow-sm"
          >
            <div className="text-xs font-medium text-slate-400">{s.label}</div>
            <div className="mt-2 text-xl font-semibold text-slate-50">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">
              Quick Actions
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/products/new"
              className="rounded-md bg-primary-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-primary-400"
            >
              New Product
            </a>
            <a
              href="/loans/new"
              className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700"
            >
              New Loan Application
            </a>
            <a
              href="/approvals"
              className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700"
            >
              Pending Approvals
            </a>
            <a
              href="/disbursements"
              className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700"
            >
              Pending Disbursements
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-100">
            Recent Activity
          </h2>
          <ul className="space-y-1 text-xs text-slate-300">
            <li>
              Loan LOAN-2025-001 approved for 50,000, awaiting disbursement.
            </li>
            <li>Product SME-001 updated eligibility rules.</li>
            <li>Disbursement DISB-2025-010 retried via MoMo channel.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
