import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService, Loan, LoanStatus } from '../../services/loan.service';
import { getErrorMessage } from '../../utils/errorHandler';

type StatusFilter = 'All' | LoanStatus;

const loanStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    Draft: 'badge badge-neutral',
    Submitted: 'badge badge-info',
    Approved: 'badge badge-success',
    Rejected: 'badge badge-danger',
    Disbursed: 'badge badge-success',
    Active: 'badge badge-success',
    Pending: 'badge badge-warning',
    Closed: 'badge badge-neutral',
  };
  return map[status] ?? 'badge badge-neutral';
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(n);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Loan Applications</h1>
          <p className="page-subtitle">Capture new applications, monitor status, and route for approval.</p>
        </div>
        <button onClick={() => navigate('/loans/new')} className="btn-primary">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Application
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="form-select w-40"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Disbursed">Disbursed</option>
          <option value="Active">Active</option>
        </select>
        <input
          type="text"
          placeholder="Customer ID..."
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          className="form-input w-44"
        />
        <input
          type="text"
          placeholder="Product code..."
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="form-input w-44"
        />
        <span className="text-xs text-neutral-400">{loans.length} applications</span>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-sm text-neutral-400">Loading applications...</div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {loans.length === 0 ? (
            <div className="py-16 text-center text-sm text-neutral-400">No loan applications found</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loan #</th>
                  <th>Customer ID</th>
                  <th>Product</th>
                  <th>Amount (RWF)</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((l) => (
                  <tr key={l.id}>
                    <td className="font-medium text-neutral-800">{l.loanNumber}</td>
                    <td className="font-mono text-xs text-neutral-500">{l.customerId.slice(0, 8)}…</td>
                    <td className="font-mono text-xs text-neutral-500">{l.loanProductId.slice(0, 8)}…</td>
                    <td>{fmt(l.requestedAmount)}</td>
                    <td><span className={loanStatusBadge(l.status)}>{l.status}</span></td>
                    <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td className="text-right">
                      <button
                        onClick={() => navigate(`/loans/${l.id}`)}
                        className="text-xs font-medium text-primary-700 hover:underline"
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
      )}
    </div>
  );
};
