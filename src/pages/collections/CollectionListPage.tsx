import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collectionService, CollectionCase } from '../../services/collection.service';
import { getErrorMessage } from '../../utils/errorHandler';

const casePriorityBadge = (priority: string) => {
  const map: Record<string, string> = {
    High: 'badge badge-danger',
    Medium: 'badge badge-warning',
    Low: 'badge badge-neutral',
  };
  return map[priority] ?? 'badge badge-neutral';
};

const caseStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    Open: 'badge badge-warning',
    InProgress: 'badge badge-info',
    PromiseToPay: 'badge badge-info',
    Escalated: 'badge badge-danger',
    Resolved: 'badge badge-success',
    Closed: 'badge badge-neutral',
    WrittenOff: 'badge badge-neutral',
  };
  return map[status] ?? 'badge badge-neutral';
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(n);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Collection Cases</h1>
          <p className="page-subtitle">Delinquent loan cases, assignments, and recovery workflow.</p>
        </div>
        <button onClick={() => navigate('/collections/new')} className="btn-primary">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Open Case
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="form-select w-44"
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="InProgress">In Progress</option>
          <option value="PromiseToPay">Promise to Pay</option>
          <option value="Escalated">Escalated</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
          <option value="WrittenOff">Written Off</option>
        </select>
        <span className="text-xs text-neutral-400">{cases.length} cases</span>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-sm text-neutral-400">Loading cases...</div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {cases.length === 0 ? (
            <div className="py-16 text-center text-sm text-neutral-400">No collection cases found</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case #</th>
                  <th>Loan ID</th>
                  <th>Customer ID</th>
                  <th>Overdue (RWF)</th>
                  <th>DPD</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/collections/${c.id}`)}
                  >
                    <td className="font-medium text-neutral-800">{c.caseNumber}</td>
                    <td className="font-mono text-xs text-neutral-500">{c.loanId.slice(0, 8)}…</td>
                    <td className="font-mono text-xs text-neutral-500">{c.customerId.slice(0, 8)}…</td>
                    <td className="font-semibold text-neutral-800">{fmt(c.overdueAmount)}</td>
                    <td>{c.daysPastDue} days</td>
                    <td><span className={caseStatusBadge(c.status)}>{c.status}</span></td>
                    <td><span className={casePriorityBadge(c.priority)}>{c.priority}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
