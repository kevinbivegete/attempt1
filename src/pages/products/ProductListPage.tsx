export const ProductListPage = () => {
  // Placeholder rows; wire to /products API later
  const products = [
    {
      id: '1',
      code: 'SME-001',
      name: 'SME Business Loan',
      status: 'Active',
      minAmount: '5,000',
      maxAmount: '500,000',
      interest: '18%',
      tenure: '6–36 mo',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Loan Products
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Configure products, fees, eligibility rules, and approval workflows.
          </p>
        </div>
        <a
          href="/products/new"
          className="rounded-md bg-primary-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-primary-400"
        >
          New Product
        </a>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-300">
        <select className="rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-slate-900 dark:text-slate-100">
          <option>Status: All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <input
          type="text"
          placeholder="Search by code or name"
          className="w-56 rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">Code</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Min / Max Amount</th>
              <th className="px-4 py-2 font-medium">Interest</th>
              <th className="px-4 py-2 font-medium">Tenure</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <td className="px-4 py-2 text-slate-900 dark:text-slate-100">
                  {p.code}
                </td>
                <td className="px-4 py-2 text-slate-900 dark:text-slate-100">
                  {p.name}
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                  {p.minAmount} – {p.maxAmount}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                  {p.interest}
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                  {p.tenure}
                </td>
                <td className="px-4 py-2 text-right">
                  <a
                    href={`/products/${p.id}`}
                    className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                  >
                    View
                  </a>
                  <span className="mx-1 text-slate-400 dark:text-slate-600">
                    •
                  </span>
                  <a
                    href={`/products/${p.id}/edit`}
                    className="text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-50"
                  >
                    Edit
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
