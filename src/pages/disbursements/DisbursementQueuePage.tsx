import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  disbursementService,
  Disbursement,
} from '../../services/disbursement.service';
import { getErrorMessage } from '../../utils/errorHandler';

type ViewFilter = 'pending-processing' | 'failed' | 'completed';

export const DisbursementQueuePage = () => {
  const navigate = useNavigate();
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [view, setView] = useState<ViewFilter>('pending-processing');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDisbursements = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await disbursementService.findAll();
        setDisbursements(data);
      } catch (err: any) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadDisbursements();
  }, []);

  const filtered = disbursements.filter((d) => {
    if (view === 'pending-processing') {
      return d.status === 'Pending' || d.status === 'Processing';
    }
    if (view === 'failed') return d.status === 'Failed';
    if (view === 'completed') return d.status === 'Completed';
    return true;
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (iso: string) =>
    new Date(iso).toISOString().slice(0, 10);

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
        <select
          value={view}
          onChange={(e) => setView(e.target.value as ViewFilter)}
          className="rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-slate-900 dark:text-slate-100"
        >
          <option value="pending-processing">View: Pending & Processing</option>
          <option value="failed">View: Failed</option>
          <option value="completed">View: Completed</option>
        </select>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-xs text-slate-600 dark:text-slate-400">
            Loading disbursements...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-slate-600 dark:text-slate-400">
            No disbursements found
          </div>
        ) : (
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Disbursement #</th>
                <th className="px-4 py-2 font-medium">Loan #</th>
                <th className="px-4 py-2 font-medium">Channel</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Created</th>
                <th className="px-4 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <td className="px-4 py-2 text-slate-900 dark:text-slate-100">
                    {d.disbursementNumber}
                  </td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                    {d.loanId}
                  </td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                    {d.channel}
                  </td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                    {formatCurrency(d.amount)}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                    {formatDate(d.createdAt)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => navigate(`/disbursements/${d.id}`)}
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
