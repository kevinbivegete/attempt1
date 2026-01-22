type ProductFormPageProps = {
  mode: 'create' | 'edit';
};

export const ProductFormPage = ({ mode }: ProductFormPageProps) => {
  const isEdit = mode === 'edit';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {isEdit ? 'Edit Product' : 'Create Product'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Define core product parameters, fees, eligibility rules, and
            approval workflow.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Core Details
            </h2>
            <div className="grid gap-3 md:grid-cols-2 text-xs">
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Product Code
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Product Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Min Amount
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Max Amount
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Interest Type
                </label>
                <select className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100">
                  <option>Flat</option>
                  <option>Declining Balance</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Tenure (months)
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Repayment Schedule
                </label>
                <select className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100">
                  <option>Monthly</option>
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                </select>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="requiresCollateral"
                  type="checkbox"
                  className="h-3 w-3 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
                <label
                  htmlFor="requiresCollateral"
                  className="text-xs text-slate-700 dark:text-slate-200"
                >
                  Requires collateral
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Operational Accounts
            </h2>
            <div className="grid gap-3 md:grid-cols-2 text-xs">
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Default Disbursement Account
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Default GL Account
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
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Fees Configuration
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Configure origination, processing, and other fees linked to this
              product.
            </p>
            <button className="mt-1 w-full rounded-md border border-dashed border-slate-300 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-300">
              + Add Fee
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Eligibility Rules
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Define income, age, and credit score thresholds as
              product_eligibility_rule.
            </p>
            <button className="mt-1 w-full rounded-md border border-dashed border-slate-300 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-300">
              + Add Rule
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Approval Workflow
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Configure approval thresholds and roles for
              product_approval_workflow.
            </p>
            <button className="mt-1 w-full rounded-md border border-dashed border-slate-300 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-300">
              + Add Step
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="flex-1 rounded-md bg-primary-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-primary-400">
              {isEdit ? 'Save Changes' : 'Create Product'}
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
