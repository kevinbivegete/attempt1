import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collectionService } from '../../services/collection.service';
import { getErrorMessage } from '../../utils/errorHandler';

export const CollectionFormPage = () => {
  const navigate = useNavigate();
  const [loanId, setLoanId] = useState('');
  const [overdueAmount, setOverdueAmount] = useState<number | ''>('');
  const [daysPastDue, setDaysPastDue] = useState<number | ''>('');
  const [priority, setPriority] = useState('Normal');
  const [originalDueDate, setOriginalDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loanId.trim() || overdueAmount === '' || daysPastDue === '') {
      setError('Loan ID, overdue amount, and days past due are required.');
      return;
    }
    try {
      setSubmitting(true);
      const created = await collectionService.create({
        loanId: loanId.trim(),
        overdueAmount: Number(overdueAmount),
        daysPastDue: Number(daysPastDue),
        priority,
        originalDueDate: originalDueDate || undefined,
        assignedTo: assignedTo.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      navigate(`/collections/${created.id}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Open collection case
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          For loans in <strong>Disbursed</strong> or <strong>Active</strong>{' '}
          status. One active workflow per loan.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div className="text-xs">
          <label className="mb-1 block text-slate-700 dark:text-slate-300">
            Loan ID
          </label>
          <input
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
            placeholder="UUID"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">
              Overdue amount
            </label>
            <input
              type="number"
              min={0}
              value={overdueAmount}
              onChange={(e) =>
                setOverdueAmount(e.target.value === '' ? '' : Number(e.target.value))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">
              Days past due
            </label>
            <input
              type="number"
              min={0}
              value={daysPastDue}
              onChange={(e) =>
                setDaysPastDue(e.target.value === '' ? '' : Number(e.target.value))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
        </div>
        <div className="text-xs">
          <label className="mb-1 block text-slate-700 dark:text-slate-300">
            Priority
          </label>
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
        <div className="text-xs">
          <label className="mb-1 block text-slate-700 dark:text-slate-300">
            Original due date (optional)
          </label>
          <input
            type="date"
            value={originalDueDate}
            onChange={(e) => setOriginalDueDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
          />
        </div>
        <div className="text-xs">
          <label className="mb-1 block text-slate-700 dark:text-slate-300">
            Assigned to (optional)
          </label>
          <input
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
          />
        </div>
        <div className="text-xs">
          <label className="mb-1 block text-slate-700 dark:text-slate-300">
            Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-md bg-primary-500 py-2 text-xs font-semibold text-slate-950 hover:bg-primary-400 disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create case'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/collections')}
            className="flex-1 rounded-md border border-slate-300 py-2 text-xs dark:border-slate-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
