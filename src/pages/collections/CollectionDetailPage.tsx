import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  collectionService,
  CollectionCase,
  CollectionActivity,
} from '../../services/collection.service';
import { getErrorMessage } from '../../utils/errorHandler';

const ACTIVITY_TYPES = [
  'Call',
  'SMS',
  'Email',
  'Letter',
  'FieldVisit',
  'PaymentReceived',
  'PromiseToPay',
  'Legal',
  'Other',
] as const;

export const CollectionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [c, setC] = useState<CollectionCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [closureReason, setClosureReason] = useState('');
  const [savingCase, setSavingCase] = useState(false);

  const [activityType, setActivityType] = useState<string>('Call');
  const [outcome, setOutcome] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [savingActivity, setSavingActivity] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await collectionService.findOne(id);
      setC(data);
      setStatus(data.status);
      setPriority(data.priority);
      setAssignedTo(data.assignedTo ?? '');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const terminal = c && ['Closed', 'WrittenOff'].includes(c.status);

  const handleSaveCase = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || terminal) return;
    try {
      setSavingCase(true);
      setError(null);
      const updated = await collectionService.update(id, {
        status,
        priority,
        assignedTo: assignedTo.trim() || null,
        closureReason: closureReason.trim() || undefined,
      });
      setC(updated);
      setClosureReason('');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSavingCase(false);
    }
  };

  const handleAddActivity = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || terminal) return;
    try {
      setSavingActivity(true);
      setError(null);
      await collectionService.addActivity(id, {
        activityType,
        outcome: outcome.trim() || undefined,
        amount: amount === '' ? undefined : Number(amount),
        notes: notes.trim() || undefined,
        performedBy: performedBy.trim() || undefined,
      });
      setOutcome('');
      setAmount('');
      setNotes('');
      setPerformedBy('');
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSavingActivity(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }
  if (!c) {
    return (
      <div className="space-y-2">
        {error && (
          <p className="text-sm text-rose-600">{error}</p>
        )}
        <button
          type="button"
          onClick={() => navigate('/collections')}
          className="text-xs text-primary-600"
        >
          Back to list
        </button>
      </div>
    );
  }

  const activities: CollectionActivity[] = c.activities ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate('/collections')}
            className="mb-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            ← Collections
          </button>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {c.caseNumber}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Loan <span className="font-mono text-xs">{c.loanId}</span> · Customer{' '}
            <span className="font-mono text-xs">{c.customerId}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Summary
          </h2>
          <dl className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between gap-4">
              <dt>Overdue</dt>
              <dd className="font-medium">{formatCurrency(c.overdueAmount)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Days past due</dt>
              <dd>{c.daysPastDue}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Opened</dt>
              <dd>{new Date(c.openedAt).toISOString().slice(0, 10)}</dd>
            </div>
            {c.closedAt && (
              <div className="flex justify-between gap-4">
                <dt>Closed</dt>
                <dd>{new Date(c.closedAt).toISOString().slice(0, 10)}</dd>
              </div>
            )}
            {c.notes && (
              <div>
                <dt className="text-slate-500">Case notes</dt>
                <dd className="mt-1 text-slate-600 dark:text-slate-400">{c.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Update case
          </h2>
          {terminal ? (
            <p className="mt-2 text-xs text-slate-500">
              This case is {c.status} and cannot be edited.
            </p>
          ) : (
            <form onSubmit={handleSaveCase} className="mt-3 space-y-2 text-xs">
              <div>
                <label className="mb-1 block text-slate-600">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="Open">Open</option>
                  <option value="InProgress">In progress</option>
                  <option value="PromiseToPay">Promise to pay</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                  <option value="WrittenOff">Written off</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-slate-600">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-slate-600">Assigned to</label>
                <input
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
              {(status === 'Closed' || status === 'WrittenOff') && (
                <div>
                  <label className="mb-1 block text-slate-600">
                    Closure reason
                  </label>
                  <input
                    value={closureReason}
                    onChange={(e) => setClosureReason(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={savingCase}
                className="mt-2 w-full rounded-md bg-slate-200 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                {savingCase ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Activity log
        </h2>
        {!terminal && (
          <form
            onSubmit={handleAddActivity}
            className="mt-3 grid gap-2 border-b border-slate-100 pb-4 text-xs dark:border-slate-800 md:grid-cols-2 lg:grid-cols-4"
          >
            <div>
              <label className="mb-1 block text-slate-600">Type</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-slate-600">Outcome</label>
              <input
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-600">Amount</label>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
                placeholder="e.g. payment"
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-600">By</label>
              <input
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className="mb-1 block text-slate-600">Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                disabled={savingActivity}
                className="rounded-md bg-primary-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-primary-400 disabled:opacity-50"
              >
                {savingActivity ? 'Adding…' : 'Log activity'}
              </button>
            </div>
          </form>
        )}
        <ul className="mt-3 space-y-2 text-xs">
          {activities.length === 0 ? (
            <li className="text-slate-500">No activities yet.</li>
          ) : (
            activities.map((a) => (
              <li
                key={a.id}
                className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/80"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {a.activityType}
                  </span>
                  <span className="text-slate-500">
                    {new Date(a.createdAt).toISOString().slice(0, 16).replace('T', ' ')}
                  </span>
                </div>
                {a.outcome && (
                  <p className="mt-1 text-slate-600 dark:text-slate-400">
                    Outcome: {a.outcome}
                  </p>
                )}
                {a.amount != null && (
                  <p className="text-slate-700 dark:text-slate-300">
                    Amount: {formatCurrency(a.amount)}
                  </p>
                )}
                {a.performedBy && (
                  <p className="text-slate-500">By {a.performedBy}</p>
                )}
                {a.notes && (
                  <p className="mt-1 text-slate-600 dark:text-slate-400">{a.notes}</p>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};
