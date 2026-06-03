import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService, Loan } from '../../services/loan.service';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuth } from '../../contexts/AuthContext';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-RW', { minimumFractionDigits: 0 }).format(n);

export const ApprovalWorkbenchPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pendingLoans, setPendingLoans] = useState<Loan[]>([]);
  const [submittedLoans, setSubmittedLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Approve dialog
  const [approvingLoan, setApprovingLoan] = useState<Loan | null>(null);
  const [approvedAmount, setApprovedAmount] = useState<number | ''>('');
  const [submittingApproval, setSubmittingApproval] = useState(false);

  // Reject dialog
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingRejection, setSubmittingRejection] = useState(false);

  // Submit action (inline, no dialog needed)
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => { loadLoans(); }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pending, submitted] = await Promise.all([
        loanService.findAll({ status: 'Pending' }),
        loanService.findAll({ status: 'Submitted' }),
      ]);
      setPendingLoans(pending);
      setSubmittedLoans(submitted);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (loanId: string) => {
    try {
      setSubmittingId(loanId);
      await loanService.submitForApproval(loanId);
      await loadLoans();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSubmittingId(null);
    }
  };

  const handleApprove = async () => {
    if (!approvingLoan || approvedAmount === '') return;
    try {
      setSubmittingApproval(true);
      await loanService.approve(approvingLoan.id, {
        approvedAmount: Number(approvedAmount),
        approvedBy: user?.email ?? 'system',
      });
      setApprovingLoan(null);
      setApprovedAmount('');
      await loadLoans();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectReason.trim()) return;
    try {
      setSubmittingRejection(true);
      await loanService.reject(rejectingId, {
        rejectedBy: user?.email ?? 'system',
        rejectionReason: rejectReason.trim(),
      });
      setRejectingId(null);
      setRejectReason('');
      await loadLoans();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSubmittingRejection(false);
    }
  };

  const totalPending = pendingLoans.length;
  const totalSubmitted = submittedLoans.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Approval Workbench</h1>
        <p className="page-subtitle">
          {totalPending} awaiting submission · {totalSubmitted} ready for decision
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-sm text-neutral-400">Loading...</div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Submitted — ready for Approve / Reject ── */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="badge badge-info">{totalSubmitted}</span>
              <h2 className="text-sm font-semibold text-neutral-800">Submitted — Awaiting Decision</h2>
            </div>
            <div className="card overflow-hidden">
              {submittedLoans.length === 0 ? (
                <div className="py-10 text-center text-sm text-neutral-400">
                  No loans submitted for review yet.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Loan #</th>
                      <th>Customer</th>
                      <th>Amount (RWF)</th>
                      <th>Rate</th>
                      <th>Tenure</th>
                      <th>Submitted</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submittedLoans.map((l) => (
                      <tr key={l.id}>
                        <td
                          className="cursor-pointer font-medium text-primary-700 hover:underline"
                          onClick={() => navigate(`/loans/${l.id}`)}
                        >
                          {l.loanNumber}
                        </td>
                        <td className="font-mono text-xs text-neutral-500">{l.customerId.slice(0, 8)}…</td>
                        <td className="font-semibold text-neutral-800">{fmt(l.requestedAmount)}</td>
                        <td>{l.interestRate}%</td>
                        <td>{l.tenureMonths} mo</td>
                        <td>{new Date(l.applicationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setApprovingLoan(l); setApprovedAmount(l.requestedAmount); }}
                              className="rounded-lg bg-success px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingId(l.id)}
                              className="rounded-lg bg-danger px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90 transition"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ── Pending — needs submission first ── */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="badge badge-warning">{totalPending}</span>
              <h2 className="text-sm font-semibold text-neutral-800">Pending — Awaiting Submission</h2>
              <span className="text-xs text-neutral-400">Submit to move loans into the review queue above</span>
            </div>
            <div className="card overflow-hidden">
              {pendingLoans.length === 0 ? (
                <div className="py-10 text-center text-sm text-neutral-400">
                  No pending loan applications.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Loan #</th>
                      <th>Customer</th>
                      <th>Amount (RWF)</th>
                      <th>Rate</th>
                      <th>Tenure</th>
                      <th>Created</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLoans.map((l) => (
                      <tr key={l.id}>
                        <td
                          className="cursor-pointer font-medium text-primary-700 hover:underline"
                          onClick={() => navigate(`/loans/${l.id}`)}
                        >
                          {l.loanNumber}
                        </td>
                        <td className="font-mono text-xs text-neutral-500">{l.customerId.slice(0, 8)}…</td>
                        <td className="font-semibold text-neutral-800">{fmt(l.requestedAmount)}</td>
                        <td>{l.interestRate}%</td>
                        <td>{l.tenureMonths} mo</td>
                        <td>{new Date(l.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="text-right">
                          <button
                            onClick={() => handleSubmit(l.id)}
                            disabled={submittingId === l.id}
                            className="rounded-lg border border-primary-300 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition disabled:opacity-50"
                          >
                            {submittingId === l.id ? 'Submitting...' : 'Submit for Review'}
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

      {/* ── Approve Dialog ── */}
      {approvingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/40">
          <div className="card w-full max-w-sm p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-neutral-800">
              Approve — {approvingLoan.loanNumber}
            </h2>
            <p className="text-sm text-neutral-500">
              Requested: <strong className="text-neutral-800">{fmt(approvingLoan.requestedAmount)} RWF</strong>
            </p>
            <div>
              <label className="form-label">Approved Amount (RWF)</label>
              <input
                type="number"
                min={0}
                max={approvingLoan.requestedAmount}
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="form-input"
              />
            </div>
            <p className="text-xs text-neutral-400">
              Approver: <strong className="text-neutral-600">{user?.email ?? 'system'}</strong>
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleApprove}
                disabled={submittingApproval || approvedAmount === ''}
                className="btn-primary flex-1 justify-center"
              >
                {submittingApproval ? 'Approving...' : 'Confirm Approval'}
              </button>
              <button
                onClick={() => { setApprovingLoan(null); setApprovedAmount(''); }}
                className="btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Dialog ── */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/40">
          <div className="card w-full max-w-sm p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-neutral-800">Reject Loan</h2>
            <div>
              <label className="form-label">Reason for Rejection</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Insufficient income, high credit risk..."
                className="form-input resize-none"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleReject}
                disabled={submittingRejection || !rejectReason.trim()}
                className="btn-danger flex-1 justify-center"
              >
                {submittingRejection ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
              <button
                onClick={() => { setRejectingId(null); setRejectReason(''); }}
                className="btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
