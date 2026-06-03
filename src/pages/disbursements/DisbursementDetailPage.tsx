import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  disbursementService,
  Disbursement,
} from '../../services/disbursement.service';
import { getErrorMessage } from '../../utils/errorHandler';

export const DisbursementDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [disbursement, setDisbursement] = useState<Disbursement | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDisbursement = async (withLoading = true) => {
    if (!id) return;
    try {
      if (withLoading) {
        setLoading(true);
        setError(null);
      }
      const { details } = await disbursementService.getStatus(id);
      setDisbursement(details);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      if (withLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let interval: number | undefined;

    // Initial load with spinner
    loadDisbursement(true);

    // Start polling while status is Pending/Processing
    interval = window.setInterval(async () => {
      await loadDisbursement(false);
      setDisbursement((current) => {
        if (
          current &&
          current.status !== 'Pending' &&
          current.status !== 'Processing'
        ) {
          if (interval) {
            window.clearInterval(interval);
          }
        }
        return current;
      });
    }, 2000);

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (iso: string | null | undefined) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString();
  };

  const handleRetry = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      const updated = await disbursementService.retry(id);
      setDisbursement(updated);
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReverse = async () => {
    if (!id) return;
    const reason = window.prompt(
      'Provide a reason for reversing this disbursement:',
    );
    if (!reason || !reason.trim()) {
      return;
    }
    try {
      setActionLoading(true);
      const updated = await disbursementService.reverse(id, {
        reversalReason: reason.trim(),
      });
      setDisbursement(updated);
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-neutral-400">
          Loading disbursement...
        </div>
      </div>
    );
  }

  if (error || !disbursement) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error || 'Disbursement not found'}
        </div>
        <button
          onClick={() => navigate('/disbursements')}
          className="btn-secondary"
        >
          Back to Disbursements
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">
            {disbursement.disbursementNumber}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Loan {disbursement.loanId} • {disbursement.channel} •{' '}
            {disbursement.status}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRetry}
            disabled={
              actionLoading || disbursement.status !== 'Failed'
            }
            className="btn-secondary"
          >
            Retry Disbursement
          </button>
          <button
            onClick={handleReverse}
            disabled={
              actionLoading || disbursement.status !== 'Completed'
            }
            className="btn-danger"
          >
            Reverse Disbursement
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-neutral-800">
              Disbursement Details
            </h2>
            <dl className="grid gap-3 text-xs text-neutral-800 sm:grid-cols-2">
              <div>
                <dt className="text-neutral-500">Disbursement #</dt>
                <dd>{disbursement.disbursementNumber}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Loan #</dt>
                <dd>{disbursement.loanId}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Amount</dt>
                <dd>{formatCurrency(disbursement.amount)}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Channel</dt>
                <dd>{disbursement.channel}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Recipient Name</dt>
                <dd>{disbursement.recipientName ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Recipient Account</dt>
                <dd>{disbursement.recipientAccount ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Status</dt>
                <dd>
                  <span className="inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                    {disbursement.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-neutral-800">
              Timestamps
            </h2>
            <dl className="grid gap-3 text-xs text-neutral-800 sm:grid-cols-2">
              <div>
                <dt className="text-neutral-500">Created At</dt>
                <dd>{formatDateTime(disbursement.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Disbursed At</dt>
                <dd>{formatDateTime(disbursement.disbursedAt ?? null)}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Completed At</dt>
                <dd>{formatDateTime(disbursement.completedAt ?? null)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-2 text-sm font-semibold text-neutral-800">
              Transaction Info
            </h2>
            <dl className="space-y-2 text-xs text-neutral-800">
              <div>
                <dt className="text-neutral-500">Transaction ID</dt>
                <dd>{disbursement.transactionId ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Failure Reason</dt>
                <dd>{disbursement.failureReason ?? '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="mb-2 text-sm font-semibold text-neutral-800">
              History
            </h2>
            <p className="text-xs text-neutral-500">
              Future extension: show retries and reversals for this
              disbursement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
