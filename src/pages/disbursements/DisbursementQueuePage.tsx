import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { disbursementService, Disbursement } from '../../services/disbursement.service';
import { loanService, Loan } from '../../services/loan.service';
import { getErrorMessage } from '../../utils/errorHandler';

const disbStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    Pending:    'badge badge-warning',
    Processing: 'badge badge-info',
    Completed:  'badge badge-success',
    Failed:     'badge badge-danger',
    Reversed:   'badge badge-neutral',
  };
  return map[status] ?? 'badge badge-neutral';
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-RW', { minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const DisbursementQueuePage = () => {
  const navigate = useNavigate();
  const [approvedLoans, setApprovedLoans] = useState<Loan[]>([]);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [disbView, setDisbView] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [loans, disbs] = await Promise.all([
        loanService.findAll({ status: 'Approved' }),
        disbursementService.findAll(),
      ]);
      setApprovedLoans(loans);
      setDisbursements(disbs);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredDisb = disbursements.filter((d) => {
    if (disbView === 'pending')   return d.status === 'Pending' || d.status === 'Processing';
    if (disbView === 'completed') return d.status === 'Completed';
    if (disbView === 'failed')    return d.status === 'Failed' || d.status === 'Reversed';
    return true;
  });

  // For each approved loan, compute how much has already been disbursed
  const loanDisbursedMap: Record<string, number> = {};
  disbursements.forEach((d) => {
    if (d.status === 'Completed') {
      loanDisbursedMap[d.loanId] = (loanDisbursedMap[d.loanId] ?? 0) + d.amount;
    }
  });

  // Only show approved loans that still have a remaining balance
  const readyToDisburse = approvedLoans.filter((l) => {
    const disbursed = loanDisbursedMap[l.id] ?? 0;
    return (l.approvedAmount ?? 0) - disbursed > 0;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="page-header mb-0">
        <h1 className="page-title">Disbursement Queue</h1>
        <p className="page-subtitle">Disburse approved loans and track all disbursement transactions.</p>
      </div>

      {error && (
        <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-xs text-neutral-400">
          Loading…
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Section 1: Approved loans ready to disburse ── */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="badge badge-success">{readyToDisburse.length}</span>
              <h2 className="text-xs font-semibold text-neutral-700">Approved — Ready to Disburse</h2>
            </div>

            <div className="card overflow-hidden">
              {readyToDisburse.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400">
                  No approved loans awaiting disbursement.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Loan #</th>
                      <th>Customer ID</th>
                      <th className="text-right">Approved (RWF)</th>
                      <th className="text-right">Disbursed (RWF)</th>
                      <th className="text-right">Remaining (RWF)</th>
                      <th>Approved On</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readyToDisburse.map((l) => {
                      const disbursed  = loanDisbursedMap[l.id] ?? 0;
                      const remaining  = (l.approvedAmount ?? 0) - disbursed;
                      return (
                        <tr key={l.id}>
                          <td
                            className="cursor-pointer font-medium text-primary-700 hover:underline"
                            onClick={() => navigate(`/loans/${l.id}`)}
                          >
                            {l.loanNumber}
                          </td>
                          <td className="font-mono text-neutral-500">{l.customerId.slice(0, 8)}…</td>
                          <td className="text-right font-semibold text-neutral-800">{fmt(l.approvedAmount ?? 0)}</td>
                          <td className="text-right text-neutral-500">{fmt(disbursed)}</td>
                          <td className="text-right font-semibold text-primary-700">{fmt(remaining)}</td>
                          <td className="text-neutral-500">
                            {l.approvalDate ? fmtDate(l.approvalDate) : '—'}
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => navigate('/disbursements/new', { state: { loanId: l.id } })}
                              className="btn-primary py-1 px-3 text-[10px]"
                            >
                              Disburse
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ── Section 2: Disbursement transactions ── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="badge badge-neutral">{filteredDisb.length}</span>
                <h2 className="text-xs font-semibold text-neutral-700">Disbursement Transactions</h2>
              </div>
              <select
                value={disbView}
                onChange={(e) => setDisbView(e.target.value as typeof disbView)}
                className="form-select w-44"
              >
                <option value="all">All</option>
                <option value="pending">Pending / Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed / Reversed</option>
              </select>
            </div>

            <div className="card overflow-hidden">
              {filteredDisb.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400">
                  No disbursement transactions found.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ref #</th>
                      <th>Loan ID</th>
                      <th>Channel</th>
                      <th>Recipient</th>
                      <th className="text-right">Amount (RWF)</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDisb.map((d) => (
                      <tr key={d.id}>
                        <td className="font-medium text-neutral-800">{d.disbursementNumber}</td>
                        <td className="font-mono text-neutral-500">{d.loanId.slice(0, 8)}…</td>
                        <td>{d.channel}</td>
                        <td className="text-neutral-500">{d.recipientName ?? '—'}</td>
                        <td className="text-right font-semibold text-neutral-800">{fmt(d.amount)}</td>
                        <td><span className={disbStatusBadge(d.status)}>{d.status}</span></td>
                        <td className="text-neutral-500">{fmtDate(d.createdAt)}</td>
                        <td className="text-right">
                          <button
                            onClick={() => navigate(`/disbursements/${d.id}`)}
                            className="text-[10px] font-medium text-primary-700 hover:underline"
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

        </div>
      )}
    </div>
  );
};
