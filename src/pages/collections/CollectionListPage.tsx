import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collectionService,
  CollectionCase,
} from '../../services/collection.service';
import { getErrorMessage } from '../../utils/errorHandler';

export const CollectionListPage = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CollectionCase[]>([]);
  const [status, setStatus] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await collectionService.findAll({
          status: status === 'All' ? undefined : status,
        });
        setCases(data);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [status]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Collections
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Delinquent loan cases, assignments, and recovery workflow.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/collections/new')}
          className="rounded-md bg-primary-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-primary-400"
        >
          Open case
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-slate-900 dark:text-slate-100"
        >
          <option value="All">Status: All</option>
          <option value="Open">Open</option>
          <option value="InProgress">In progress</option>
          <option value="PromiseToPay">Promise to pay</option>
          <option value="Escalated">Escalated</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
          <option value="WrittenOff">Written off</option>
        </select>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : cases.length === 0 ? (
        <p className="text-sm text-slate-500">No collection cases.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Case
                </th>
                <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Loan
                </th>
                <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Customer
                </th>
                <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Overdue
                </th>
                <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  DPD
                </th>
                <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </th>
                <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60"
                  onClick={() => navigate(`/collections/${c.id}`)}
                >
                  <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">
                    {c.caseNumber}
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                    {c.loanId.slice(0, 8)}…
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                    {c.customerId.slice(0, 8)}…
                  </td>
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">
                    {formatCurrency(c.overdueAmount)}
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                    {c.daysPastDue}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                    {c.status}
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                    {c.priority}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
