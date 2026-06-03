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
        <h1 className="page-title">
          Open collection case
        </h1>
        <p className="mt-1 page-subtitle">
          For loans in <strong>Disbursed</strong> or <strong>Active</strong>{' '}
          status. One active workflow per loan.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="card p-5 space-y-4"
      >
        <div className="text-xs">
          <label className="form-label">
            Loan ID
          </label>
          <input
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            className="form-input"
            placeholder="UUID"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="form-label">
              Overdue amount
            </label>
            <input
              type="number"
              min={0}
              value={overdueAmount}
              onChange={(e) =>
                setOverdueAmount(e.target.value === '' ? '' : Number(e.target.value))
              }
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">
              Days past due
            </label>
            <input
              type="number"
              min={0}
              value={daysPastDue}
              onChange={(e) =>
                setDaysPastDue(e.target.value === '' ? '' : Number(e.target.value))
              }
              className="form-input"
            />
          </div>
        </div>
        <div className="text-xs">
          <label className="form-label">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="form-input"
          >
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="text-xs">
          <label className="form-label">
            Original due date (optional)
          </label>
          <input
            type="date"
            value={originalDueDate}
            onChange={(e) => setOriginalDueDate(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="text-xs">
          <label className="form-label">
            Assigned to (optional)
          </label>
          <input
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="text-xs">
          <label className="form-label">
            Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1 justify-center"
          >
            {submitting ? 'Creating…' : 'Create case'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/collections')}
            className="btn-secondary flex-1 justify-center"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
