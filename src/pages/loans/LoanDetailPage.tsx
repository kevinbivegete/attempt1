import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loanService, Loan } from '../../services/loan.service';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuth } from '../../contexts/AuthContext';

export const LoanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadLoan = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await loanService.findOne(id);
      setLoan(data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoan();
  }, [id]);

  const handleSubmitForApproval = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      const updated = await loanService.submitForApproval(id);
      setLoan(updated);
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id || !loan) return;
    try {
      setActionLoading(true);
      const updated = await loanService.approve(id, {
        approvedAmount: loan.requestedAmount,
        approvedBy: user?.userId ?? 'system',
      });
      setLoan(updated);
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!id || !rejectionReason.trim()) {
      return;
    }
    try {
      setActionLoading(true);
      const updated = await loanService.reject(id, {
        rejectedBy: user?.userId ?? 'system',
        rejectionReason: rejectionReason.trim(),
      });
      setLoan(updated);
      setShowRejectDialog(false);
      setRejectionReason('');
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Loading loan...
        </div>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          {error || 'Loan not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">
            {loan.loanNumber}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Customer {loan.customerId} • Product {loan.loanProductId} •{' '}
            {loan.status}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/loans')}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800"
          >
            Back to Applications
          </button>
          <button
            onClick={handleSubmitForApproval}
            disabled={actionLoading || loan.status !== 'Pending'}
            className="rounded-md bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-50"
          >
            Submit for Approval
          </button>
          <button
            onClick={handleApprove}
            disabled={actionLoading || loan.status !== 'Pending'}
            className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => setShowRejectDialog(true)}
            disabled={actionLoading || loan.status !== 'Pending'}
            className="rounded-md bg-rose-500 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-rose-400 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">
              Core Loan Information
            </h2>
            <dl className="grid gap-3 text-xs text-slate-200 sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">Product ID</dt>
                <dd>{loan.loanProductId}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Requested Amount</dt>
                <dd>{formatCurrency(loan.requestedAmount)}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Approved Amount</dt>
                <dd>{formatCurrency(loan.approvedAmount ?? null)}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Interest / Tenure</dt>
                <dd>
                  {loan.interestRate}% • {loan.tenureMonths} months
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Status</dt>
                <dd>
                  <span className="inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                    {loan.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">
              Eligibility Result
            </h2>
            <div className="rounded-md border border-emerald-700/60 bg-emerald-900/30 p-3 text-xs text-emerald-100">
              PASSED – Customer meets income, age, and credit score thresholds.
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">
              Disbursement Summary
            </h2>
            <dl className="grid gap-3 text-xs text-slate-200 sm:grid-cols-3">
              <div>
                <dt className="text-slate-400">Total Approved</dt>
                <dd>{formatCurrency(loan.approvedAmount ?? null)}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Total Disbursed</dt>
                <dd>{formatCurrency(loan.disbursedAmount ?? null)}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Remaining</dt>
                <dd>
                  {formatCurrency(
                    (loan.approvedAmount ?? 0) - (loan.disbursedAmount ?? 0),
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">
              Approval Info
            </h2>
            <p className="text-xs text-slate-400">
              {loan.approvalDate
                ? `Approved by ${loan.approvedBy ?? 'N/A'} on ${new Date(
                    loan.approvalDate,
                  ).toLocaleString()}`
                : 'Once approved, this section will show approver, approved amount, and approval timestamp.'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">
              Disbursements
            </h2>
            <p className="text-xs text-slate-400">
              After approval, initiate disbursement from here and view
              disbursement history.
            </p>
            <button className="mt-2 w-full rounded-md bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700">
              Initiate Disbursement
            </button>
          </div>
        </div>
      </div>
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-100">Reject loan</h2>
            <p className="mt-1 text-xs text-slate-400">
              Provide a reason for rejecting this loan application.
            </p>
            <label className="mt-3 mb-1 block text-xs font-medium text-slate-200">
              Rejection reason
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-1 h-24 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
            />
            <div className="mt-3 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                }}
                className="rounded-md border border-slate-600 px-3 py-1 text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="rounded-md bg-rose-500 px-3 py-1 font-medium text-slate-950 hover:bg-rose-400 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
