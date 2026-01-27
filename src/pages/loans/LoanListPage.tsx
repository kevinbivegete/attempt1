import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService, Loan, LoanStatus } from '../../services/loan.service';
import { getErrorMessage } from '../../utils/errorHandler';

type StatusFilter = 'All' | LoanStatus;

export const LoanListPage = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [customerFilter, setCustomerFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLoans = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loanService.findAll({
          status: statusFilter,
          customerId: customerFilter || undefined,
          productCode: productFilter || undefined,
        });
        setLoans(data);
      } catch (err: any) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadLoans();
  }, [statusFilter, customerFilter, productFilter]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (iso: string) =>
    new Date(iso).toISOString().slice(0, 10);

  const filteredLoans = loans;

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
        <button
          onClick={() => navigate('/loans/new')}
          className="rounded-md bg-primary-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-primary-400"
        >
          New Application
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-300">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-slate-900 dark:text-slate-100"
        >
          <option value="All">Status: All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Disbursed">Disbursed</option>
          <option value="Active">Active</option>
        </select>
        <input
          type="text"
          placeholder="Customer ID"
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          className="w-36 rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
        />
        <input
          type="text"
          placeholder="Product code"
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="w-36 rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-xs text-slate-600 dark:text-slate-400">
            Loading loans...
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-slate-600 dark:text-slate-400">
            No loan applications found
          </div>
        ) : (
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Loan #</th>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Product ID</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Created</th>
                <th className="px-4 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((l) => (
                <tr
                  key={l.id}
                  className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <td className="px-4 py-2 text-slate-900 dark:text-slate-100">
                    {l.loanNumber}
                  </td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                    {l.customerId}
                  </td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                    {l.loanProductId}
                  </td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                    {formatCurrency(l.requestedAmount)}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                    {formatDate(l.createdAt)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => navigate(`/loans/${l.id}`)}
                      className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
