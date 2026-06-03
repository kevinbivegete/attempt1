import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService, Customer, BusinessCustomer } from '../../services/customer.service';
import { getErrorMessage } from '../../utils/errorHandler';

type Tab = 'individual' | 'business';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: 'badge badge-success',
    SUSPENDED: 'badge badge-warning',
    CLOSED: 'badge badge-neutral',
  };
  return map[status] ?? 'badge badge-neutral';
};

export const CustomerListPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('individual');
  const [individuals, setIndividuals] = useState<Customer[]>([]);
  const [businesses, setBusinesses] = useState<BusinessCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'SUSPENDED'>('all');
  const [registerOpen, setRegisterOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAll();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setRegisterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ind, biz] = await Promise.all([
        customerService.findAll(),
        customerService.findAllBusiness(),
      ]);
      setIndividuals(ind);
      setBusinesses(biz);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const filteredIndividuals = individuals.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.full_name.toLowerCase().includes(q) ||
      c.customer_number.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone_number.includes(q) ||
      c.national_id.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredBusinesses = businesses.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.company_name.toLowerCase().includes(q) ||
      c.customer_number.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      c.phone_number.includes(q) ||
      c.registration_number.toLowerCase().includes(q) ||
      c.tin.includes(q);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabBtn = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition ${
      tab === t
        ? 'bg-primary-700 text-white shadow-sm'
        : 'text-neutral-500 hover:bg-primary-100 hover:text-primary-700'
    }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Customer Registry</h1>
          <p className="page-subtitle">
            {individuals.length} individuals · {businesses.length} businesses registered
          </p>
        </div>

        {/* Register dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setRegisterOpen((o) => !o)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Register Customer
            <svg className={`h-3.5 w-3.5 transition-transform ${registerOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {registerOpen && (
            <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-neutral-200 bg-white shadow-lg py-1">
              <button
                onClick={() => { setRegisterOpen(false); navigate('/customers/new/individual'); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition"
              >
                <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                Individual Customer
              </button>
              <button
                onClick={() => { setRegisterOpen(false); navigate('/customers/new/business'); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition"
              >
                <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
                Business Customer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-neutral-100 p-1 w-fit">
        <button className={tabBtn('individual')} onClick={() => setTab('individual')}>
          Individual ({individuals.length})
        </button>
        <button className={tabBtn('business')} onClick={() => setTab('business')}>
          Business ({businesses.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="form-select w-36"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <input
          type="text"
          placeholder={tab === 'individual' ? 'Search by name, ID, phone...' : 'Search by name, TIN, phone...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input w-72"
        />
        <span className="text-xs text-neutral-400">
          {tab === 'individual' ? filteredIndividuals.length : filteredBusinesses.length} customers
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-sm text-neutral-400">Loading customers...</div>
        </div>
      ) : tab === 'individual' ? (
        /* ── Individual Customers Table ── */
        <div className="card overflow-hidden">
          {filteredIndividuals.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-neutral-400">No individual customers found.</p>
              <button
                onClick={() => navigate('/customers/new/individual')}
                className="btn-primary mt-4 text-sm"
              >
                Register First Individual
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer #</th>
                  <th>Full Name</th>
                  <th>National ID</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Registered</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIndividuals.map((c) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/customers/${c.id}`)}
                  >
                    <td className="font-mono text-xs text-neutral-500">{c.customer_number}</td>
                    <td className="font-medium text-neutral-800">{c.full_name}</td>
                    <td className="font-mono text-xs text-neutral-500">{c.national_id}</td>
                    <td>{c.phone_number}</td>
                    <td>{c.email}</td>
                    <td>{c.age}</td>
                    <td><span className={statusBadge(c.status)}>{c.status}</span></td>
                    <td>
                      <span className={c.is_verified ? 'badge badge-info' : 'badge badge-neutral'}>
                        {c.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>{new Date(c.registration_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => navigate(`/customers/${c.id}`)} className="text-xs font-medium text-primary-700 hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* ── Business Customers Table ── */
        <div className="card overflow-hidden">
          {filteredBusinesses.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-neutral-400">No business customers found.</p>
              <button
                onClick={() => navigate('/customers/new/business')}
                className="btn-primary mt-4 text-sm"
              >
                Register First Business
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer #</th>
                  <th>Company Name</th>
                  <th>TIN</th>
                  <th>Business Type</th>
                  <th>Industry</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Registered</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBusinesses.map((c) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/customers/business/${c.id}`)}
                  >
                    <td className="font-mono text-xs text-neutral-500">{c.customer_number}</td>
                    <td className="font-medium text-neutral-800">{c.company_name}</td>
                    <td className="font-mono text-xs text-neutral-500">{c.tin}</td>
                    <td>{c.business_type}</td>
                    <td>{c.industry}</td>
                    <td>{c.phone_number}</td>
                    <td><span className={statusBadge(c.status)}>{c.status}</span></td>
                    <td>
                      <span className={c.is_verified ? 'badge badge-info' : 'badge badge-neutral'}>
                        {c.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>{new Date(c.registration_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => navigate(`/customers/business/${c.id}`)} className="text-xs font-medium text-primary-700 hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
