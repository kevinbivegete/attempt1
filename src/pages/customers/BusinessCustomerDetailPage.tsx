import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { customerService, BusinessCustomer } from '../../services/customer.service';
import { getErrorMessage } from '../../utils/errorHandler';

const statusBadge = (status: BusinessCustomer['status']) => {
  const map: Record<string, string> = {
    ACTIVE: 'badge badge-success',
    SUSPENDED: 'badge badge-warning',
    CLOSED: 'badge badge-neutral',
  };
  return map[status] ?? 'badge badge-neutral';
};

const Detail = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <dt className="text-xs font-medium text-neutral-400">{label}</dt>
    <dd className="mt-0.5 text-sm text-neutral-800">{value || '—'}</dd>
  </div>
);

export const BusinessCustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<BusinessCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    customerService
      .findOneBusiness(id)
      .then(setCustomer)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-sm text-neutral-400">Loading customer...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Link to="/customers" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-primary-700 transition">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </Link>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error ?? 'Customer not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/customers" className="mb-2 inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-primary-700 transition">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Customer Registry
          </Link>
          <h1 className="page-title">{customer.company_name}</h1>
          <div className="mt-1 flex items-center gap-3">
            <span className="font-mono text-xs text-neutral-500">{customer.customer_number}</span>
            <span className={statusBadge(customer.status)}>{customer.status}</span>
            <span className={customer.is_verified ? 'badge badge-info' : 'badge badge-neutral'}>
              {customer.is_verified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/loans/new?businessCustomerId=${customer.id}`)}
            className="btn-primary"
          >
            Apply for Loan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Information */}
          <div className="card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-400">Business Information</h2>
            <dl className="grid grid-cols-2 gap-4">
              <Detail label="Company Name" value={customer.company_name} />
              <Detail label="Trading Name" value={customer.trading_name} />
              <Detail label="Registration Number" value={customer.registration_number} />
              <Detail label="TIN Number" value={customer.tin} />
              <Detail label="Business Type" value={customer.business_type} />
              <Detail label="Industry" value={customer.industry} />
              <Detail label="Date of Incorporation" value={customer.date_of_incorporation ? new Date(customer.date_of_incorporation).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : undefined} />
              <Detail label="Registered" value={customer.registration_date ? new Date(customer.registration_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined} />
            </dl>
          </div>

          {/* Contact & Address */}
          <div className="card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-400">Contact & Address</h2>
            <dl className="grid grid-cols-2 gap-4">
              <Detail label="Phone" value={customer.phone_number} />
              <Detail label="Email" value={customer.email} />
              <Detail label="Website" value={customer.website} />
              <div className="col-span-2">
                <Detail label="Business Address" value={customer.business_address} />
              </div>
              <Detail label="Province" value={customer.province} />
              <Detail label="District" value={customer.district} />
              <Detail label="Sector" value={customer.sector} />
            </dl>
          </div>
        </div>

        {/* Quick stats sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/loans/new?businessCustomerId=${customer.id}`)}
                className="btn-primary w-full justify-center text-sm"
              >
                New Loan Application
              </button>
              <button
                onClick={() => navigate(`/loans?businessCustomer=${customer.id}`)}
                className="btn-ghost w-full justify-center text-sm"
              >
                View Loan History
              </button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Account Status</span>
                <span className={statusBadge(customer.status)}>{customer.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Verification</span>
                <span className={customer.is_verified ? 'badge badge-info' : 'badge badge-neutral'}>
                  {customer.is_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
