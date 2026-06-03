import { useEffect, useState, useMemo } from 'react';
import { loanService, Loan } from '../../services/loan.service';
import {
  repaymentService,
  LoanRepaymentSummary,
  RepaymentInstallment,
  PaymentRecord,
  ScheduleRevision,
  RecordPaymentRequest,
  CreateRevisionRequest,
  PaymentFrequency,
} from '../../services/repayment.service';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuth } from '../../contexts/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number | undefined | null) => {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-RW', { minimumFractionDigits: 0 }).format(n);
};

const fmtDate = (d?: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB');
};

const today = () => new Date().toISOString().split('T')[0];

const daysOverdue = (dueDate: string) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - due.getTime()) / 86_400_000);
  return diff > 0 ? diff : 0;
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

const revisionStatusClass = (s: string) => {
  const m: Record<string, string> = {
    Pending: 'badge-warning',
    Approved: 'badge-success',
    Rejected: 'badge-danger',
  };
  return `badge ${m[s] ?? 'badge-neutral'}`;
};

type Tab = 'active' | 'overdue' | 'installments' | 'payments' | 'revisions';

interface LoanWithSummary {
  loan: Loan;
  summary: LoanRepaymentSummary | null;
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────
interface RecordPaymentModalProps {
  loan: Loan;
  installmentId?: string;
  outstandingAmount?: number;
  onClose: () => void;
  onSuccess: () => void;
  userEmail: string;
}

function RecordPaymentModal({
  loan,
  installmentId,
  outstandingAmount,
  onClose,
  onSuccess,
  userEmail,
}: RecordPaymentModalProps) {
  const [installments, setInstallments] = useState<RepaymentInstallment[]>([]);
  const [selectedInstallmentId, setSelectedInstallmentId] = useState(installmentId ?? '');
  const [amount, setAmount] = useState<number | ''>(outstandingAmount ?? '');
  const [paymentDate, setPaymentDate] = useState(today());
  const [channel, setChannel] = useState('MoMo');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [receivedBy, setReceivedBy] = useState(userEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingInst, setLoadingInst] = useState(false);

  useEffect(() => {
    if (!installmentId) {
      setLoadingInst(true);
      repaymentService
        .getInstallments(loan.id)
        .then((data) => {
          const open = data.filter(
            (i) => i.status === 'Due' || i.status === 'Overdue' || i.status === 'Partial',
          );
          setInstallments(open);
          if (open.length > 0 && !selectedInstallmentId) {
            setSelectedInstallmentId(open[0].id);
            setAmount(open[0].outstandingAmount);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingInst(false));
    }
  }, [loan.id, installmentId]);

  const handleInstallmentChange = (id: string) => {
    setSelectedInstallmentId(id);
    const inst = installments.find((i) => i.id === id);
    if (inst) setAmount(inst.outstandingAmount);
  };

  const handleSubmit = async () => {
    if (!selectedInstallmentId || amount === '' || !paymentDate || !receivedBy) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const req: RecordPaymentRequest = {
        installmentId: selectedInstallmentId,
        loanId: loan.id,
        amount: Number(amount),
        paymentDate,
        channel,
        reference: reference || undefined,
        receivedBy,
        notes: notes || undefined,
      };
      await repaymentService.recordPayment(req);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/50">
      <div className="card w-full max-w-md p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-800">Record Payment</h2>
          <button onClick={onClose} className="btn-ghost text-neutral-500">
            ✕
          </button>
        </div>
        <p className="text-[10px] text-neutral-500">
          Loan: <strong className="text-neutral-700">{loan.loanNumber}</strong>
        </p>

        {error && (
          <div className="border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        {!installmentId && (
          <div>
            <label className="form-label">Installment *</label>
            {loadingInst ? (
              <p className="text-[10px] text-neutral-400">Loading installments…</p>
            ) : installments.length === 0 ? (
              <p className="text-[10px] text-neutral-400">No open installments found.</p>
            ) : (
              <select
                className="form-select"
                value={selectedInstallmentId}
                onChange={(e) => handleInstallmentChange(e.target.value)}
              >
                {installments.map((i) => (
                  <option key={i.id} value={i.id}>
                    #{i.installmentNumber} — Due {fmtDate(i.dueDate)} — Outstanding{' '}
                    {fmt(i.outstandingAmount)} RWF
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="form-label">Amount (RWF) *</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="form-input"
              placeholder="0"
            />
          </div>

          <div>
            <label className="form-label">Payment Date *</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Channel *</label>
            <select
              className="form-select"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option value="MoMo">MoMo</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="form-label">Reference</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="form-input"
              placeholder="Transaction reference (optional)"
            />
          </div>

          <div className="col-span-2">
            <label className="form-label">Received By *</label>
            <input
              type="text"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="col-span-2">
            <label className="form-label">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input resize-none"
              placeholder="Optional notes"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedInstallmentId || amount === ''}
            className="btn-primary flex-1 justify-center"
          >
            {loading ? 'Recording…' : 'Record Payment'}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Request Revision Modal ───────────────────────────────────────────────────
interface RevisionModalProps {
  loan: Loan;
  scheduleId: string;
  onClose: () => void;
  onSuccess: () => void;
  userEmail: string;
}

function RevisionModal({ loan, scheduleId, onClose, onSuccess, userEmail }: RevisionModalProps) {
  const [reason, setReason] = useState('');
  const [requestedBy, setRequestedBy] = useState(userEmail);
  const [newFrequency, setNewFrequency] = useState<PaymentFrequency | ''>('');
  const [newAmount, setNewAmount] = useState<number | ''>('');
  const [newRate, setNewRate] = useState<number | ''>('');
  const [newStartDate, setNewStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim() || !requestedBy.trim()) {
      setError('Reason and Requested By are required.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const req: CreateRevisionRequest = {
        scheduleId,
        loanId: loan.id,
        reason: reason.trim(),
        requestedBy: requestedBy.trim(),
        newFrequency: newFrequency || undefined,
        newInstallmentAmount: newAmount !== '' ? Number(newAmount) : undefined,
        newInterestRate: newRate !== '' ? Number(newRate) : undefined,
        newStartDate: newStartDate || undefined,
      };
      await repaymentService.requestRevision(req);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/50">
      <div className="card w-full max-w-md p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-800">Request Schedule Revision</h2>
          <button onClick={onClose} className="btn-ghost text-neutral-500">
            ✕
          </button>
        </div>
        <p className="text-[10px] text-neutral-500">
          Loan: <strong className="text-neutral-700">{loan.loanNumber}</strong>
        </p>

        {error && (
          <div className="border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="form-label">Reason *</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-input resize-none"
              placeholder="Explain why the schedule needs revision"
            />
          </div>

          <div>
            <label className="form-label">Requested By *</label>
            <input
              type="text"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              className="form-input"
            />
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            New Terms (optional — leave blank to keep current)
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">New Frequency</label>
              <select
                className="form-select"
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value as PaymentFrequency | '')}
              >
                <option value="">— No change —</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BI_WEEKLY">Bi-Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>

            <div>
              <label className="form-label">New Installment Amount</label>
              <input
                type="number"
                min={0}
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="form-input"
                placeholder="RWF"
              />
            </div>

            <div>
              <label className="form-label">New Interest Rate (%)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={newRate}
                onChange={(e) => setNewRate(e.target.value === '' ? '' : Number(e.target.value))}
                className="form-input"
                placeholder="%"
              />
            </div>

            <div>
              <label className="form-label">New Start Date</label>
              <input
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className="btn-primary flex-1 justify-center"
          >
            {loading ? 'Submitting…' : 'Submit Revision'}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export const RecoveryPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loansWithSummary, setLoansWithSummary] = useState<LoanWithSummary[]>([]);
  const [allInstallments, setAllInstallments] = useState<
    (RepaymentInstallment & { loanNumber: string })[]
  >([]);
  const [allPayments, setAllPayments] = useState<(PaymentRecord & { loanNumber: string })[]>([]);
  const [allRevisions, setAllRevisions] = useState<(ScheduleRevision & { loanNumber: string; scheduleId: string })[]>([]);
  const [scheduleMap, setScheduleMap] = useState<Record<string, string>>({}); // loanId → scheduleId

  const [installmentStatusFilter, setInstallmentStatusFilter] = useState('All');

  // Modals
  const [paymentModal, setPaymentModal] = useState<{
    loan: Loan;
    installmentId?: string;
    outstandingAmount?: number;
  } | null>(null);
  const [revisionModal, setRevisionModal] = useState<{
    loan: Loan;
    scheduleId: string;
  } | null>(null);
  const [revisionAction, setRevisionAction] = useState<{
    revision: ScheduleRevision & { loanNumber: string; scheduleId: string };
    action: 'approve' | 'reject';
    rejectionReason: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const userEmail = user?.email ?? 'system';

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const allLoans = await loanService.findAll();
      const activeLoans = allLoans.filter(
        (l) => l.status === 'Disbursed' || l.status === 'Active',
      );

      // Load summaries, installments, payments, revisions for all active loans in parallel
      const results = await Promise.allSettled(
        activeLoans.map(async (loan) => {
          const [summary, installments, payments, revisions] = await Promise.allSettled([
            repaymentService.getSummary(loan.id),
            repaymentService.getInstallments(loan.id),
            repaymentService.getPayments(loan.id),
            repaymentService.getRevisions(loan.id),
          ]);

          let scheduleId = '';
          try {
            const sched = await repaymentService.getSchedule(loan.id);
            scheduleId = sched.id;
          } catch {
            // no schedule yet
          }

          return {
            loan,
            summary: summary.status === 'fulfilled' ? summary.value : null,
            installments:
              installments.status === 'fulfilled'
                ? installments.value.map((i) => ({ ...i, loanNumber: loan.loanNumber }))
                : [],
            payments:
              payments.status === 'fulfilled'
                ? payments.value.map((p) => ({ ...p, loanNumber: loan.loanNumber }))
                : [],
            revisions:
              revisions.status === 'fulfilled'
                ? revisions.value.map((r) => ({ ...r, loanNumber: loan.loanNumber, scheduleId }))
                : [],
            scheduleId,
          };
        }),
      );

      const lws: LoanWithSummary[] = [];
      const instList: (RepaymentInstallment & { loanNumber: string })[] = [];
      const payList: (PaymentRecord & { loanNumber: string })[] = [];
      const revList: (ScheduleRevision & { loanNumber: string; scheduleId: string })[] = [];
      const sMap: Record<string, string> = {};

      results.forEach((r) => {
        if (r.status === 'fulfilled') {
          const { loan, summary, installments, payments, revisions, scheduleId } = r.value;
          lws.push({ loan, summary });
          instList.push(...installments);
          payList.push(...payments);
          revList.push(...revisions);
          if (scheduleId) sMap[loan.id] = scheduleId;
        }
      });

      setLoansWithSummary(lws);
      setAllInstallments(instList);
      setAllPayments(payList);
      setAllRevisions(revList);
      setScheduleMap(sMap);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const totalOutstanding = useMemo(
    () => loansWithSummary.reduce((s, l) => s + (l.summary?.totalOutstanding ?? 0), 0),
    [loansWithSummary],
  );
  const totalOverdue = useMemo(
    () => loansWithSummary.reduce((s, l) => s + (l.summary?.overdueAmount ?? 0), 0),
    [loansWithSummary],
  );

  const thisMonthPaid = useMemo(() => {
    const now = new Date();
    return allPayments
      .filter((p) => {
        const d = new Date(p.paymentDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, p) => s + p.amount, 0);
  }, [allPayments]);

  const overdueInstallments = useMemo(
    () => allInstallments.filter((i) => i.status === 'Overdue'),
    [allInstallments],
  );

  const filteredInstallments = useMemo(() => {
    if (installmentStatusFilter === 'All') return allInstallments;
    return allInstallments.filter((i) => i.status === installmentStatusFilter);
  }, [allInstallments, installmentStatusFilter]);

  const pendingRevisions = useMemo(
    () => allRevisions.filter((r) => r.status === 'Pending'),
    [allRevisions],
  );

  // ── Revision approve/reject ──────────────────────────────────────────────────
  const handleRevisionApprove = async () => {
    if (!revisionAction) return;
    try {
      setActionLoading(true);
      await repaymentService.approveRevision(revisionAction.revision.id, userEmail);
      setRevisionAction(null);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevisionReject = async () => {
    if (!revisionAction || !revisionAction.rejectionReason.trim()) return;
    try {
      setActionLoading(true);
      await repaymentService.rejectRevision(
        revisionAction.revision.id,
        userEmail,
        revisionAction.rejectionReason,
      );
      setRevisionAction(null);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string }[] = [
    { id: 'active', label: 'Active Loans' },
    { id: 'overdue', label: `Overdue (${overdueInstallments.length})` },
    { id: 'installments', label: 'Installments' },
    { id: 'payments', label: 'Payments' },
    { id: 'revisions', label: `Revisions (${pendingRevisions.length})` },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-xs text-neutral-500">
        Loading recovery data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Recovery &amp; Repayment</h1>
          <p className="page-subtitle">Monitor active loans, overdue installments, and payments.</p>
        </div>
        <button onClick={loadData} className="btn-ghost">
          Refresh
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Active Loans',
            value: loansWithSummary.length.toString(),
            sub: 'Disbursed / Active loans',
            color: 'text-neutral-800',
          },
          {
            label: 'Total Outstanding',
            value: `${fmt(totalOutstanding)} RWF`,
            sub: 'Sum of unpaid balances',
            color: 'text-neutral-800',
          },
          {
            label: 'Total Overdue',
            value: `${fmt(totalOverdue)} RWF`,
            sub: `${overdueInstallments.length} overdue installments`,
            color: totalOverdue > 0 ? 'text-rose-600' : 'text-neutral-800',
          },
          {
            label: 'This Month Collected',
            value: `${fmt(thisMonthPaid)} RWF`,
            sub: 'Payments received this month',
            color: 'text-emerald-600',
          },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="stat-card">
            <div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-neutral-500">
              {label}
            </div>
            <div className={`mt-1 text-xl font-bold ${color}`}>{value}</div>
            <div className="text-[10px] text-neutral-400">{sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-[#e0822d] text-[#e0822d]'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Active Loans */}
      {activeTab === 'active' && (
        <div className="card overflow-hidden">
          {loansWithSummary.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-xs text-neutral-400">
              No active loans found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Loan #</th>
                    <th>Customer ID</th>
                    <th className="text-right">Approved (RWF)</th>
                    <th className="text-right">Total Paid (RWF)</th>
                    <th className="text-right">Outstanding (RWF)</th>
                    <th className="text-right">Completion</th>
                    <th>Next Due Date</th>
                    <th className="text-right">Next Due (RWF)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loansWithSummary.map(({ loan, summary }) => (
                    <tr key={loan.id}>
                      <td className="font-medium text-neutral-800">{loan.loanNumber}</td>
                      <td className="font-mono text-[10px] text-neutral-500">
                        {loan.customerId.slice(0, 12)}…
                      </td>
                      <td className="text-right">{fmt(loan.approvedAmount)}</td>
                      <td className="text-right">{fmt(summary?.totalPaid)}</td>
                      <td className="text-right font-semibold text-neutral-800">
                        {fmt(summary?.totalOutstanding)}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 bg-neutral-200">
                            <div
                              className="h-1.5 bg-[#e0822d]"
                              style={{
                                width: `${Math.min(summary?.completionPercentage ?? 0, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-neutral-600">
                            {(summary?.completionPercentage ?? 0).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td>{fmtDate(summary?.nextDueDate)}</td>
                      <td className="text-right">{fmt(summary?.nextDueAmount)}</td>
                      <td>
                        <span
                          className={`badge ${
                            loan.status === 'Active' ? 'badge-success' : 'badge-info'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() =>
                              setPaymentModal({ loan })
                            }
                            className="btn-primary px-2 py-1"
                          >
                            Record Payment
                          </button>
                          {scheduleMap[loan.id] && (
                            <button
                              onClick={() =>
                                setRevisionModal({
                                  loan,
                                  scheduleId: scheduleMap[loan.id],
                                })
                              }
                              className="btn-ghost px-2 py-1"
                            >
                              Revise
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Overdue */}
      {activeTab === 'overdue' && (
        <div className="card overflow-hidden">
          {overdueInstallments.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-xs text-neutral-400">
              No overdue installments.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Loan #</th>
                    <th className="text-right">Installment #</th>
                    <th>Due Date</th>
                    <th className="text-right">Days Overdue</th>
                    <th className="text-right">Overdue Amount (RWF)</th>
                    <th className="text-right">Penalty (RWF)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueInstallments.map((inst) => {
                    const lws = loansWithSummary.find((l) => l.loan.id === inst.loanId);
                    const loan = lws?.loan;
                    return (
                      <tr key={inst.id}>
                        <td className="font-medium text-neutral-800">{inst.loanNumber}</td>
                        <td className="text-right">{inst.installmentNumber}</td>
                        <td>{fmtDate(inst.dueDate)}</td>
                        <td className="text-right">
                          <span className="font-semibold text-rose-600">
                            {daysOverdue(inst.dueDate)}d
                          </span>
                        </td>
                        <td className="text-right font-semibold text-rose-700">
                          {fmt(inst.outstandingAmount)}
                        </td>
                        <td className="text-right">{fmt(inst.penaltyAmount)}</td>
                        <td>
                          {loan && (
                            <button
                              onClick={() =>
                                setPaymentModal({
                                  loan,
                                  installmentId: inst.id,
                                  outstandingAmount: inst.outstandingAmount,
                                })
                              }
                              className="btn-primary px-2 py-1"
                            >
                              Record Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Installments */}
      {activeTab === 'installments' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="form-label mb-0">Filter by Status:</label>
            <select
              className="form-select w-44"
              value={installmentStatusFilter}
              onChange={(e) => setInstallmentStatusFilter(e.target.value)}
            >
              {['All', 'Upcoming', 'Due', 'Paid', 'Partial', 'Overdue', 'Defaulted', 'Waived'].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ),
              )}
            </select>
            <span className="text-[10px] text-neutral-500">
              {filteredInstallments.length} installment
              {filteredInstallments.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="card overflow-hidden">
            {filteredInstallments.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-xs text-neutral-400">
                No installments match the selected filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Loan #</th>
                      <th className="text-right">#</th>
                      <th>Due Date</th>
                      <th className="text-right">Principal (RWF)</th>
                      <th className="text-right">Interest (RWF)</th>
                      <th className="text-right">Total Due (RWF)</th>
                      <th className="text-right">Paid (RWF)</th>
                      <th>Progress</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstallments.map((inst) => {
                      const pct =
                        inst.totalDue > 0
                          ? Math.min((inst.paidAmount / inst.totalDue) * 100, 100)
                          : 0;
                      return (
                        <tr key={inst.id}>
                          <td className="font-medium text-neutral-800">{inst.loanNumber}</td>
                          <td className="text-right text-neutral-500">
                            {inst.installmentNumber}
                          </td>
                          <td>{fmtDate(inst.dueDate)}</td>
                          <td className="text-right">{fmt(inst.principalAmount)}</td>
                          <td className="text-right">{fmt(inst.interestAmount)}</td>
                          <td className="text-right font-semibold text-neutral-800">
                            {fmt(inst.totalDue)}
                          </td>
                          <td className="text-right text-emerald-700">{fmt(inst.paidAmount)}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 bg-neutral-200">
                                <div
                                  className="h-1.5 bg-emerald-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-neutral-500">
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={installmentStatusClass(inst.status)}>
                              {inst.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Payments */}
      {activeTab === 'payments' && (
        <div className="card overflow-hidden">
          {allPayments.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-xs text-neutral-400">
              No payments recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Payment #</th>
                    <th>Loan #</th>
                    <th className="text-right">Amount (RWF)</th>
                    <th>Channel</th>
                    <th>Payment Date</th>
                    <th>Reference</th>
                    <th>Received By</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="font-mono text-[10px] text-neutral-600">{p.paymentNumber}</td>
                      <td className="font-medium text-neutral-800">{p.loanNumber}</td>
                      <td className="text-right font-semibold text-emerald-700">
                        {fmt(p.amount)}
                      </td>
                      <td>
                        <span className="badge badge-info">{p.channel}</span>
                      </td>
                      <td>{fmtDate(p.paymentDate)}</td>
                      <td className="text-neutral-500">{p.reference ?? '—'}</td>
                      <td className="text-neutral-600">{p.receivedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Revisions */}
      {activeTab === 'revisions' && (
        <div className="card overflow-hidden">
          {allRevisions.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-xs text-neutral-400">
              No schedule revisions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Loan #</th>
                    <th>Rev #</th>
                    <th>Requested By</th>
                    <th>Reason</th>
                    <th>New Terms</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allRevisions.map((rev) => (
                    <tr key={rev.id}>
                      <td className="font-medium text-neutral-800">{rev.loanNumber}</td>
                      <td className="text-neutral-500">{rev.revisionNumber}</td>
                      <td className="text-neutral-600">{rev.requestedBy}</td>
                      <td className="max-w-[200px] truncate text-neutral-700">{rev.reason}</td>
                      <td className="text-[10px] text-neutral-500">
                        {[
                          rev.newFrequency && `Freq: ${rev.newFrequency}`,
                          rev.newInstallmentAmount &&
                            `Amt: ${fmt(rev.newInstallmentAmount)} RWF`,
                          rev.newInterestRate && `Rate: ${rev.newInterestRate}%`,
                          rev.newStartDate && `Start: ${fmtDate(rev.newStartDate)}`,
                        ]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </td>
                      <td>
                        <span className={revisionStatusClass(rev.status)}>{rev.status}</span>
                      </td>
                      <td>
                        {rev.status === 'Pending' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() =>
                                setRevisionAction({
                                  revision: rev,
                                  action: 'approve',
                                  rejectionReason: '',
                                })
                              }
                              className="btn-primary px-2 py-1"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                setRevisionAction({
                                  revision: rev,
                                  action: 'reject',
                                  rejectionReason: '',
                                })
                              }
                              className="btn-danger px-2 py-1"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModal && (
        <RecordPaymentModal
          loan={paymentModal.loan}
          installmentId={paymentModal.installmentId}
          outstandingAmount={paymentModal.outstandingAmount}
          onClose={() => setPaymentModal(null)}
          onSuccess={() => {
            setPaymentModal(null);
            loadData();
          }}
          userEmail={userEmail}
        />
      )}

      {/* Revision Request Modal */}
      {revisionModal && (
        <RevisionModal
          loan={revisionModal.loan}
          scheduleId={revisionModal.scheduleId}
          onClose={() => setRevisionModal(null)}
          onSuccess={() => {
            setRevisionModal(null);
            loadData();
          }}
          userEmail={userEmail}
        />
      )}

      {/* Revision Approve/Reject Dialog */}
      {revisionAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/50">
          <div className="card w-full max-w-sm p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-neutral-800">
              {revisionAction.action === 'approve' ? 'Approve' : 'Reject'} Revision
            </h2>
            <p className="text-xs text-neutral-600">
              Loan:{' '}
              <strong className="text-neutral-800">{revisionAction.revision.loanNumber}</strong>
            </p>
            <p className="text-xs text-neutral-500">Reason: {revisionAction.revision.reason}</p>

            {revisionAction.action === 'reject' && (
              <div>
                <label className="form-label">Rejection Reason *</label>
                <textarea
                  rows={3}
                  className="form-input resize-none"
                  value={revisionAction.rejectionReason}
                  onChange={(e) =>
                    setRevisionAction((prev) =>
                      prev ? { ...prev, rejectionReason: e.target.value } : null,
                    )
                  }
                  placeholder="Explain why this revision is rejected"
                />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              {revisionAction.action === 'approve' ? (
                <button
                  onClick={handleRevisionApprove}
                  disabled={actionLoading}
                  className="btn-primary flex-1 justify-center"
                >
                  {actionLoading ? 'Approving…' : 'Confirm Approval'}
                </button>
              ) : (
                <button
                  onClick={handleRevisionReject}
                  disabled={actionLoading || !revisionAction.rejectionReason.trim()}
                  className="btn-danger flex-1 justify-center"
                >
                  {actionLoading ? 'Rejecting…' : 'Confirm Rejection'}
                </button>
              )}
              <button
                onClick={() => setRevisionAction(null)}
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
