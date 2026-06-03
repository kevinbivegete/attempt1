import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService, Customer } from '../../services/customer.service';
import { getErrorMessage } from '../../utils/errorHandler';

const statusBadge = (status: Customer['status']) => {
  const map: Record<string, string> = {
    ACTIVE: 'badge badge-success',
    SUSPENDED: 'badge badge-warning',
    CLOSED: 'badge badge-neutral',
  };
  return map[status] ?? 'badge badge-neutral';
};

export const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    customerService
      .findOne(id)
      .then(setCustomer)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-sm text-neutral-400">Loading customer...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error ?? 'Customer not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/customers')}
        className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Customers
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{customer.full_name}</h1>
          <p className="page-subtitle">{customer.customer_number}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={statusBadge(customer.status)}>{customer.status}</span>
          <span className={customer.is_verified ? 'badge badge-info' : 'badge badge-neutral'}>
            {customer.is_verified ? 'Verified' : 'Unverified'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Personal Info */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-800">Personal Information</h2>
          <dl className="space-y-3">
            {[
              { label: 'Full Name', value: customer.full_name },
              { label: 'National ID', value: customer.national_id, mono: true },
              { label: 'Age', value: `${customer.age} years` },
              {
                label: 'Registration Date',
                value: new Date(customer.registration_date).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                }),
              },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex justify-between text-sm">
                <dt className="text-neutral-500">{label}</dt>
                <dd className={`font-medium text-neutral-800 ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Contact Info */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-800">Contact Information</h2>
          <dl className="space-y-3">
            {[
              { label: 'Email', value: customer.email },
              { label: 'Phone', value: customer.phone_number },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <dt className="text-neutral-500">{label}</dt>
                <dd className="font-medium text-neutral-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-800">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/loans/new?customerId=${customer.id}`)}
            className="btn-primary"
          >
            New Loan Application
          </button>
          <button
            onClick={() => navigate(`/loans?customerId=${customer.id}`)}
            className="btn-secondary"
          >
            View Loans
          </button>
        </div>
      </div>
    </div>
  );
};
