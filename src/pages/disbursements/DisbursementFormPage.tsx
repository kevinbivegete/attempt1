import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loanService, Loan } from '../../services/loan.service';
import {
  disbursementService,
  Disbursement,
} from '../../services/disbursement.service';
import { getErrorMessage } from '../../utils/errorHandler';

export const DisbursementFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { loanId?: string } };
  const loanIdFromState = location.state?.loanId;

  const [loan, setLoan] = useState<Loan | null>(null);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [amount, setAmount] = useState<number | ''>('');
  const [channel, setChannel] = useState('MoMo');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approvedAmount = loan?.approvedAmount ?? 0;
  const totalDisbursed = disbursements
    .filter((d) => d.status === 'Completed')
    .reduce((sum, d) => sum + d.amount, 0);
  const remaining = Math.max(approvedAmount - totalDisbursed, 0);

  useEffect(() => {
    const loadData = async () => {
      if (!loanIdFromState) {
        setError('Missing loan context. Please navigate here from a loan.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const [loanData, disbData] = await Promise.all([
          loanService.findOne(loanIdFromState),
          disbursementService.findByLoan(loanIdFromState),
        ]);
        setLoan(loanData);
        setDisbursements(disbData);
        if (loanData.approvedAmount) {
          const remainingAmount =
            loanData.approvedAmount -
            disbData
              .filter((d) => d.status === 'Completed')
              .reduce((sum, d) => sum + d.amount, 0);
          setAmount(remainingAmount > 0 ? remainingAmount : loanData.approvedAmount);
        }
      } catch (err: any) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [loanIdFromState]);

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!loan || !loanIdFromState || amount === '' || amount <= 0) {
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const disb = await disbursementService.create({
        loanId: loanIdFromState,
        amount: Number(amount),
        channel,
        recipientAccount: recipientAccount || undefined,
        recipientName: recipientName || undefined,
      });
      navigate(`/disbursements/${disb.id}`);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-neutral-500">
          Loading disbursement form...
        </div>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="rounded-md bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}
        <button
          onClick={() => navigate('/loans')}
          className="btn-secondary"
        >
          Back to Loans
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">
            Initiate Disbursement
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Pre-filled with approved loan details. Capture channel and recipient
            information.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-800">
              Loan Summary
            </h2>
            <dl className="grid gap-3 text-xs text-neutral-800 sm:grid-cols-2">
              <div>
                <dt className="text-neutral-500">Loan #</dt>
                <dd className="font-medium">{loan.loanNumber}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">
                  Approved Amount
                </dt>
                <dd className="font-medium">
                  {formatCurrency(loan.approvedAmount ?? null)}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">
                  Total Disbursed
                </dt>
                <dd className="font-medium">
                  {formatCurrency(totalDisbursed)}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">
                  Remaining
                </dt>
                <dd className="font-medium">{formatCurrency(remaining)}</dd>
              </div>
            </dl>
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-800">
              Disbursement Details
            </h2>
            <div className="grid gap-3 md:grid-cols-2 text-xs">
              <div>
                <label className="form-label">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">
                  Channel
                </label>
                <select
                  className="form-input"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option value="MoMo">MoMo</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Supplier">Supplier</option>
                </select>
              </div>
              <div>
                <label className="form-label">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">
                  Recipient Account / Wallet
                </label>
                <input
                  type="text"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-800">
              Confirmation
            </h2>
            <p className="text-xs text-neutral-500">
              On save, this will call{' '}
              <code className="text-[11px] text-primary-600 dark:text-primary-300">
                POST /disbursements
              </code>{' '}
              and move this item into the disbursement queue.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={
                submitting ||
                amount === '' ||
                amount <= 0 ||
                remaining <= 0
              }
              className="btn-primary flex-1 justify-center"
            >
              {submitting ? 'Creating...' : 'Create Disbursement'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/loans/${loan.id}`)}
              className="btn-secondary flex-1 justify-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
