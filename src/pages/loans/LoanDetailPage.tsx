import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loanService, Loan } from '../../services/loan.service';
import {
  repaymentService,
  type RepaymentSchedule,
  type RepaymentInstallment,
  type PaymentRecord,
  type LoanRepaymentSummary,
  type CreateScheduleRequest,
  type RecordPaymentRequest,
  type PaymentFrequency,
  type InterestRateType,
} from '../../services/repayment.service';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuth } from '../../contexts/AuthContext';

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

const fmtDate = (d?: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB');
};

const installmentStatusClass = (s: string) => {
  const m: Record<string, string> = {
    Paid: 'badge-success',
    Upcoming: 'badge-neutral',
    Due: 'badge-info',
    Partial: 'badge-warning',
    Overdue: 'badge-danger',
    Defaulted: 'badge-danger',
    Waived: 'badge-neutral',
  };
  return `badge ${m[s] ?? 'badge-neutral'}`;
};

// ─── Repayment Schedule Card ──────────────────────────────────────────────────
interface RepaymentSectionProps {
  loan: Loan;
  userEmail: string;
}

function RepaymentSection({ loan, userEmail }: RepaymentSectionProps) {
  const [schedule, setSchedule] = useState<RepaymentSchedule | null>(null);
  const [summary, setSummary] = useState<LoanRepaymentSummary | null>(null);
  const [installments, setInstallments] = useState<RepaymentInstallment[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [showAllInstallments, setShowAllInstallments] = useState(false);

  // Create-schedule form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<PaymentFrequency>('MONTHLY');
  const [interestRateType, setInterestRateType] = useState<InterestRateType>('FLAT');
  const [interestRate, setInterestRate] = useState<number>(loan.interestRate ?? 0);
  const [gracePeriodDays, setGracePeriodDays] = useState<number>(0);
  const [penaltyRate, setPenaltyRate] = useState<number>(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [createdBy, setCreatedBy] = useState(userEmail);

  // Payment modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payInstallmentId, setPayInstallmentId] = useState('');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payChannel, setPayChannel] = useState('MoMo');
  const [payReference, setPayReference] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payReceivedBy, setPayReceivedBy] = useState(userEmail);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const loadRepayment = async () => {
    setLoadingSchedule(true);
    try {
      const [sched, summ] = await Promise.all([
        repaymentService.getSchedule(loan.id),
        repaymentService.getSummary(loan.id).catch(() => null),
      ]);
      setSchedule(sched);
      setSummary(summ);
      const [insts, pays] = await Promise.all([
        repaymentService.getInstallments(loan.id).catch(() => []),
        repaymentService.getPayments(loan.id).catch(() => []),
      ]);
      setInstallments(insts);
      setPayments(pays);
    } catch {
      // No schedule yet
      setSchedule(null);
      setSummary(null);
      setInstallments([]);
      setPayments([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    loadRepayment();
  }, [loan.id]);

  const handleCreateSchedule = async () => {
    try {
      setCreateLoading(true);
      setCreateError(null);
      const req: CreateScheduleRequest = {
        loanId: loan.id,
        frequency,
        interestRateType,
        interestRate,
        gracePeriodDays,
        penaltyRate,
        startDate,
        createdBy,
      };
      await repaymentService.createSchedule(req);
      setShowCreateForm(false);
      await loadRepayment();
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!payInstallmentId || payAmount === '') {
      setPayError('Select an installment and enter amount.');
      return;
    }
    try {
      setPayLoading(true);
      setPayError(null);
      const req: RecordPaymentRequest = {
        installmentId: payInstallmentId,
        loanId: loan.id,
        amount: Number(payAmount),
        paymentDate: payDate,
        channel: payChannel,
        reference: payReference || undefined,
        receivedBy: payReceivedBy,
        notes: payNotes || undefined,
      };
      await repaymentService.recordPayment(req);
      setPayModalOpen(false);
      setPayInstallmentId('');
      setPayAmount('');
      setPayReference('');
      setPayNotes('');
      await loadRepayment();
    } catch (err) {
      setPayError(getErrorMessage(err));
    } finally {
      setPayLoading(false);
    }
  };

  const fmtAmt = (n: number | null | undefined) => {
    if (n == null) return '—';
    return new Intl.NumberFormat('en-RW', { minimumFractionDigits: 0 }).format(n);
  };

  const canSetup = !schedule && (loan.status === 'Approved' || loan.status === 'Active' || loan.status === 'Disbursed');
  const displayedInstallments = showAllInstallments ? installments : installments.slice(0, 5);

  if (loadingSchedule) {
    return (
      <div className="card p-5">
        <h2 className="mb-2 text-sm font-semibold text-neutral-800">Repayment Schedule</h2>
        <p className="text-xs text-neutral-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-800">Repayment Schedule</h2>
        {schedule && (
          <button
            onClick={() => setPayModalOpen(true)}
            className="btn-primary px-3 py-1.5"
          >
            Record Payment
          </button>
        )}
      </div>

      {/* No schedule + can setup */}
      {canSetup && !showCreateForm && (
        <div className="border border-dashed border-neutral-300 px-4 py-6 text-center">
          <p className="mb-3 text-xs text-neutral-500">No repayment schedule set up yet.</p>
          <button onClick={() => setShowCreateForm(true)} className="btn-primary">
            Setup Repayment Schedule
          </button>
        </div>
      )}

      {/* No schedule + can't setup */}
      {!canSetup && !schedule && (
        <div className="text-xs text-neutral-400">
          Repayment schedule will be available after loan approval and disbursement.
        </div>
      )}

      {/* Create schedule form */}
      {canSetup && showCreateForm && (
        <div className="space-y-4 border border-neutral-200 p-4">
          <p className="text-xs font-semibold text-neutral-700">New Repayment Schedule</p>
          {createError && (
            <div className="border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {createError}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="form-label">Frequency *</label>
              <select
                className="form-select"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as PaymentFrequency)}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BI_WEEKLY">Bi-Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
            <div>
              <label className="form-label">Interest Rate Type *</label>
              <select
                className="form-select"
                value={interestRateType}
                onChange={(e) => setInterestRateType(e.target.value as InterestRateType)}
              >
                <option value="FLAT">Flat</option>
                <option value="REDUCING_BALANCE">Reducing Balance</option>
              </select>
            </div>
            <div>
              <label className="form-label">Interest Rate (%) *</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Grace Period (days)</label>
              <input
                type="number"
                min={0}
                value={gracePeriodDays}
                onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Penalty Rate (%)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={penaltyRate}
                onChange={(e) => setPenaltyRate(Number(e.target.value))}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Created By *</label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateSchedule}
              disabled={createLoading}
              className="btn-primary"
            >
              {createLoading ? 'Creating…' : 'Create Schedule'}
            </button>
            <button onClick={() => setShowCreateForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing schedule */}
      {schedule && (
        <div className="space-y-4">
          {/* Summary stats */}
          {summary && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {[
                { label: 'Total Due', value: fmtAmt(summary.totalDue) },
                { label: 'Total Paid', value: fmtAmt(summary.totalPaid) },
                { label: 'Outstanding', value: fmtAmt(summary.totalOutstanding) },
                { label: 'Overdue', value: fmtAmt(summary.overdueAmount) },
                { label: 'Next Due Date', value: fmtDate(summary.nextDueDate) },
                { label: 'Next Due Amt', value: fmtAmt(summary.nextDueAmount) },
                { label: 'On-Time Payments', value: summary.onTimePayments.toString() },
                { label: 'Completion', value: `${(summary.completionPercentage ?? 0).toFixed(1)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="border border-neutral-200 p-2">
                  <div className="text-[10px] text-neutral-500">{label}</div>
                  <div className="mt-0.5 text-xs font-semibold text-neutral-800">{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Schedule details */}
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            {[
              { label: 'Frequency', value: schedule.frequency },
              { label: 'Rate Type', value: schedule.interestRateType },
              { label: 'Interest Rate', value: `${schedule.interestRate}%` },
              { label: 'Installments', value: schedule.totalInstallments.toString() },
              { label: 'Installment Amt', value: fmtAmt(schedule.installmentAmount) },
              { label: 'Grace Period', value: `${schedule.gracePeriodDays}d` },
              { label: 'Penalty Rate', value: `${schedule.penaltyRate}%` },
              { label: 'Start Date', value: fmtDate(schedule.startDate) },
              { label: 'End Date', value: fmtDate(schedule.endDate) },
              { label: 'Status', value: schedule.status },
            ].map(({ label, value }) => (
              <div key={label}>
                <span className="text-[10px] text-neutral-500">{label}: </span>
                <span className="font-medium text-neutral-700">{value}</span>
              </div>
            ))}
          </div>

          {/* Completion progress bar */}
          {summary && (
            <div>
              <div className="mb-1 flex justify-between text-[10px] text-neutral-500">
                <span>Repayment Progress</span>
                <span>{(summary.completionPercentage ?? 0).toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-neutral-200">
                <div
                  className="h-2 bg-[#e0822d] transition-all"
                  style={{
                    width: `${Math.min(summary.completionPercentage ?? 0, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Installments table */}
          {installments.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-neutral-700">
                  Installments ({installments.length})
                </p>
                {installments.length > 5 && (
                  <button
                    onClick={() => setShowAllInstallments(!showAllInstallments)}
                    className="text-[10px] text-[#e0822d] hover:underline"
                  >
                    {showAllInstallments ? 'Show Less' : `View All ${installments.length}`}
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-right">#</th>
                      <th>Due Date</th>
                      <th className="text-right">Total Due (RWF)</th>
                      <th className="text-right">Paid (RWF)</th>
                      <th className="text-right">Outstanding (RWF)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedInstallments.map((inst) => (
                      <tr key={inst.id}>
                        <td className="text-right text-neutral-500">{inst.installmentNumber}</td>
                        <td>{fmtDate(inst.dueDate)}</td>
                        <td className="text-right">{fmtAmt(inst.totalDue)}</td>
                        <td className="text-right text-emerald-700">{fmtAmt(inst.paidAmount)}</td>
                        <td className="text-right font-semibold text-neutral-800">
                          {fmtAmt(inst.outstandingAmount)}
                        </td>
                        <td>
                          <span className={installmentStatusClass(inst.status)}>
                            {inst.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent payments */}
          {payments.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-neutral-700">
                Recent Payments ({payments.length})
              </p>
              <div className="space-y-1">
                {payments.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between border border-neutral-200 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-neutral-500">{p.paymentNumber}</span>
                      <span className="badge badge-info">{p.channel}</span>
                      <span className="text-neutral-500">{fmtDate(p.paymentDate)}</span>
                    </div>
                    <span className="font-semibold text-emerald-700">{fmtAmt(p.amount)} RWF</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Record Payment Modal */}
      {payModalOpen && schedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/50">
          <div className="card w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-800">Record Payment</h2>
              <button onClick={() => setPayModalOpen(false)} className="btn-ghost">
                ✕
              </button>
            </div>
            {payError && (
              <div className="border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {payError}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="form-label">Installment *</label>
                <select
                  className="form-select"
                  value={payInstallmentId}
                  onChange={(e) => {
                    setPayInstallmentId(e.target.value);
                    const inst = installments.find((i) => i.id === e.target.value);
                    if (inst) setPayAmount(inst.outstandingAmount);
                  }}
                >
                  <option value="">— Select installment —</option>
                  {installments
                    .filter((i) => ['Due', 'Overdue', 'Partial'].includes(i.status))
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        #{i.installmentNumber} — Due {fmtDate(i.dueDate)} —{' '}
                        {fmtAmt(i.outstandingAmount)} RWF
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="form-label">Amount (RWF) *</label>
                <input
                  type="number"
                  min={1}
                  value={payAmount}
                  onChange={(e) =>
                    setPayAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Payment Date *</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Channel</label>
                <select
                  className="form-select"
                  value={payChannel}
                  onChange={(e) => setPayChannel(e.target.value)}
                >
                  <option value="MoMo">MoMo</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="form-label">Reference</label>
                <input
                  type="text"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  className="form-input"
                  placeholder="Optional"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Received By *</label>
                <input
                  type="text"
                  value={payReceivedBy}
                  onChange={(e) => setPayReceivedBy(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Notes</label>
                <textarea
                  rows={2}
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="form-input resize-none"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRecordPayment}
                disabled={payLoading || !payInstallmentId || payAmount === ''}
                className="btn-primary flex-1 justify-center"
              >
                {payLoading ? 'Recording…' : 'Record Payment'}
              </button>
              <button
                onClick={() => setPayModalOpen(false)}
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
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const LoanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState<number | ''>('');
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

  useEffect(() => { loadLoan(); }, [id]);

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

  const handleConfirmApprove = async () => {
    if (!id || !loan || approvedAmount === '') return;
    try {
      setActionLoading(true);
      const updated = await loanService.approve(id, {
        approvedAmount: Number(approvedAmount),
        approvedBy: user?.email ?? 'system',
      });
      setLoan(updated);
      setShowApproveDialog(false);
      setApprovedAmount('');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!id || !rejectionReason.trim()) return;
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

  const fmt = (amount: number | null | undefined) => {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-sm text-neutral-400">Loading loan...</div>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error || 'Loan not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{loan.loanNumber}</h1>
          <p className="page-subtitle">
            Customer {loan.customerId.slice(0, 8)}… · Product {loan.loanProductId.slice(0, 8)}…
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => navigate('/loans')} className="btn-ghost">
            Back
          </button>
          {loan.status === 'Pending' && (
            <button
              onClick={handleSubmitForApproval}
              disabled={actionLoading}
              className="btn-secondary"
            >
              {actionLoading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          )}
          {loan.status === 'Submitted' && (
            <>
              <button
                onClick={() => { setApprovedAmount(loan.requestedAmount); setShowApproveDialog(true); }}
                disabled={actionLoading}
                className="btn-primary"
              >
                Approve
              </button>
              <button onClick={() => setShowRejectDialog(true)} disabled={actionLoading} className="btn-danger">
                Reject
              </button>
            </>
          )}
          {loan.status === 'Approved' && (
            <button
              onClick={() => navigate('/disbursements/new', { state: { loanId: loan.id } })}
              className="btn-primary"
            >
              Initiate Disbursement
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Core Info */}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">Core Loan Information</h2>
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              {[
                { label: 'Loan Status', node: <span className={loanStatusBadge(loan.status)}>{loan.status}</span> },
                { label: 'Requested Amount', value: `${fmt(loan.requestedAmount)} RWF` },
                { label: 'Approved Amount', value: `${fmt(loan.approvedAmount ?? null)} RWF` },
                { label: 'Interest Rate', value: `${loan.interestRate}%` },
                { label: 'Tenure', value: `${loan.tenureMonths} months` },
                { label: 'Application Date', value: new Date(loan.applicationDate).toLocaleDateString() },
              ].map(({ label, value, node }) => (
                <div key={label}>
                  <dt className="text-xs text-neutral-500 mb-1">{label}</dt>
                  <dd className="font-medium text-neutral-800">{node ?? value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Eligibility */}
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-neutral-800">Eligibility Result</h2>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              PASSED — Customer meets income, age, and credit score thresholds.
            </div>
          </div>

          {/* Disbursement Summary */}
          <div className="card p-5">
            <h2 className="mb-1 text-sm font-semibold text-neutral-800">Disbursement Summary</h2>
            <p className="mb-3 text-xs text-neutral-500">
              {loan.disbursedAmount
                ? loan.status === 'Disbursed'
                  ? 'Loan fully disbursed.'
                  : 'Loan partially disbursed; additional disbursements allowed up to approved amount.'
                : 'No disbursements completed yet.'}
            </p>
            <dl className="grid grid-cols-3 gap-4 text-sm">
              {[
                { label: 'Total Approved', value: fmt(loan.approvedAmount ?? null) },
                { label: 'Total Disbursed', value: fmt(loan.disbursedAmount ?? null) },
                { label: 'Remaining', value: fmt((loan.approvedAmount ?? 0) - (loan.disbursedAmount ?? 0)) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs text-neutral-500 mb-1">{label}</dt>
                  <dd className="font-semibold text-neutral-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          {/* Approval Info */}
          <div className="card p-5">
            <h2 className="mb-2 text-sm font-semibold text-neutral-800">Approval Info</h2>
            <p className="text-xs text-neutral-500">
              {loan.approvalDate
                ? `Approved by ${loan.approvedBy ?? 'N/A'} on ${new Date(loan.approvalDate).toLocaleString()}`
                : 'Once approved, approver and timestamp will appear here.'}
            </p>
          </div>

          {/* Disbursements */}
          <div className="card p-5">
            <h2 className="mb-2 text-sm font-semibold text-neutral-800">Disbursements</h2>
            <p className="mb-3 text-xs text-neutral-500">
              After approval, initiate disbursement from here.
            </p>
            <button
              onClick={() => navigate('/disbursements/new', { state: { loanId: loan.id } })}
              className="btn-secondary w-full justify-center"
            >
              Initiate Disbursement
            </button>
          </div>
        </div>
      </div>

      {/* Repayment Schedule */}
      <RepaymentSection loan={loan} userEmail={user?.email ?? 'system'} />

      {/* Approve Dialog */}
      {showApproveDialog && loan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/40">
          <div className="card w-full max-w-sm p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-neutral-800">Approve Loan — {loan.loanNumber}</h2>
            <p className="text-sm text-neutral-500">
              Requested: <strong className="text-neutral-800">{fmt(loan.requestedAmount)} RWF</strong>
            </p>
            <div>
              <label className="form-label">Approved Amount (RWF)</label>
              <input
                type="number"
                min={0}
                max={loan.requestedAmount}
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="form-input"
              />
            </div>
            <p className="text-xs text-neutral-400">
              Approver: <strong className="text-neutral-600">{user?.email ?? 'system'}</strong>
            </p>
            {error && <p className="text-xs text-danger">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleConfirmApprove}
                disabled={actionLoading || approvedAmount === ''}
                className="btn-primary flex-1 justify-center"
              >
                {actionLoading ? 'Approving...' : 'Confirm Approval'}
              </button>
              <button
                onClick={() => { setShowApproveDialog(false); setApprovedAmount(''); setError(null); }}
                className="btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/40">
          <div className="card w-full max-w-sm p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-neutral-800">Reject Loan</h2>
            <p className="text-sm text-neutral-500">Provide a reason for rejection.</p>
            <div>
              <label className="form-label">Rejection Reason</label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="form-input resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowRejectDialog(false); setRejectionReason(''); }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="btn-danger"
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
