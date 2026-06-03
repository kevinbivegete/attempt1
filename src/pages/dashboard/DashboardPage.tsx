import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService, Loan } from '../../services/loan.service';
import { disbursementService, Disbursement } from '../../services/disbursement.service';
import { customerService } from '../../services/customer.service';
import { productService } from '../../services/product.service';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-RW', { minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Pending:   'badge badge-warning',
    Submitted: 'badge badge-info',
    Approved:  'badge badge-success',
    Rejected:  'badge badge-danger',
    Disbursed: 'badge badge-success',
    Active:    'badge badge-success',
    Closed:    'badge badge-neutral',
    Draft:     'badge badge-neutral',
    Completed: 'badge badge-success',
    Failed:    'badge badge-danger',
    Processing:'badge badge-info',
    Reversed:  'badge badge-neutral',
  };
  return map[status] ?? 'badge badge-neutral';
};

interface DashData {
  loans: Loan[];
  disbursements: Disbursement[];
  individualCount: number;
  businessCount: number;
  productCount: number;
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [loans, disbursements, individuals, businesses, products] = await Promise.all([
          loanService.findAll(),
          disbursementService.findAll().catch(() => [] as Disbursement[]),
          customerService.findAll().catch(() => []),
          customerService.findAllBusiness().catch(() => []),
          productService.findAll().catch(() => []),
        ]);
        setData({
          loans,
          disbursements,
          individualCount: individuals.length,
          businessCount: businesses.length,
          productCount: products.length,
        });
      } catch (err: any) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-xs text-neutral-500">
        Loading dashboard…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
        {error ?? 'No data'}
      </div>
    );
  }

  const { loans, disbursements, individualCount, businessCount, productCount } = data;

  // ── Loan KPIs ──
  const totalLoans      = loans.length;
  const pendingReview   = loans.filter(l => l.status === 'Pending' || l.status === 'Submitted').length;
  const awaitingDisb    = loans.filter(l => l.status === 'Approved').length;
  const activeLoans     = loans.filter(l => l.status === 'Active' || l.status === 'Disbursed').length;
  const rejectedLoans   = loans.filter(l => l.status === 'Rejected').length;
  const totalCustomers  = individualCount + businessCount;

  // ── Portfolio amounts ──
  const totalRequested  = loans.reduce((s, l) => s + l.requestedAmount, 0);
  const totalApproved   = loans.reduce((s, l) => s + (l.approvedAmount ?? 0), 0);
  const totalDisbursed  = loans.reduce((s, l) => s + (l.disbursedAmount ?? 0), 0);

  // ── Disbursement KPIs ──
  const disbCompleted   = disbursements.filter(d => d.status === 'Completed').length;
  const disbPending     = disbursements.filter(d => d.status === 'Pending' || d.status === 'Processing').length;
  const disbFailed      = disbursements.filter(d => d.status === 'Failed').length;
  const disbTotal       = disbursements.reduce((s, d) => s + (d.status === 'Completed' ? d.amount : 0), 0);

  // ── Loan status breakdown ──
  const statusGroups = ['Pending', 'Submitted', 'Approved', 'Disbursed', 'Active', 'Rejected', 'Closed'] as const;
  const statusBreakdown = statusGroups.map(st => ({
    status: st,
    count: loans.filter(l => l.status === st).length,
    amount: loans.filter(l => l.status === st).reduce((s, l) => s + l.requestedAmount, 0),
  })).filter(r => r.count > 0);

  // ── Recent items ──
  const recentLoans = [...loans].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 6);

  const recentDisb = [...disbursements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Real-time overview of your loan portfolio, customers, and disbursements.</p>
      </div>

      {/* ── Row 1: KPI Cards ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

        <div className="stat-card cursor-pointer hover:border-primary-300 transition" onClick={() => navigate('/loans')}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.4px] text-neutral-500">Total Applications</span>
            <svg className="h-4 w-4 text-primary-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-800">{totalLoans}</div>
          <div className="mt-1 text-[10px] text-neutral-500">{rejectedLoans} rejected</div>
        </div>

        <div className="stat-card cursor-pointer hover:border-primary-300 transition" onClick={() => navigate('/approvals')}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.4px] text-neutral-500">Pending Review</span>
            <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{pendingReview}</div>
          <div className="mt-1 text-[10px] text-neutral-500">{awaitingDisb} approved, awaiting disbursement</div>
        </div>

        <div className="stat-card cursor-pointer hover:border-primary-300 transition" onClick={() => navigate('/disbursements')}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.4px] text-neutral-500">Active / Disbursed</span>
            <svg className="h-4 w-4 text-success" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="mt-2 text-2xl font-bold text-success">{activeLoans}</div>
          <div className="mt-1 text-[10px] text-neutral-500">{fmt(totalDisbursed)} RWF disbursed</div>
        </div>

        <div className="stat-card cursor-pointer hover:border-primary-300 transition" onClick={() => navigate('/customers')}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.4px] text-neutral-500">Total Customers</span>
            <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-800">{totalCustomers}</div>
          <div className="mt-1 text-[10px] text-neutral-500">{individualCount} individual · {businessCount} business</div>
        </div>
      </div>

      {/* ── Row 2: Portfolio + Disbursement summary ── */}
      <div className="grid gap-3 lg:grid-cols-3">

        {/* Portfolio amounts */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-xs font-semibold text-neutral-700">Portfolio Summary (RWF)</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Requested', value: totalRequested, color: 'text-neutral-800' },
              { label: 'Total Approved',  value: totalApproved,  color: 'text-success' },
              { label: 'Total Disbursed', value: totalDisbursed, color: 'text-primary-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="border-l-2 border-neutral-300 pl-3">
                <div className="text-[10px] text-neutral-500 uppercase tracking-[0.4px]">{label}</div>
                <div className={`mt-1 text-sm font-bold ${color}`}>{fmt(value)}</div>
              </div>
            ))}
          </div>

          {/* Visual bar */}
          {totalRequested > 0 && (
            <div className="mt-5">
              <div className="mb-1 flex justify-between text-[10px] text-neutral-400">
                <span>Approval rate</span>
                <span>{Math.round((totalApproved / totalRequested) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-200">
                <div
                  className="h-1.5 bg-success transition-all"
                  style={{ width: `${Math.min(100, (totalApproved / totalRequested) * 100)}%` }}
                />
              </div>
              <div className="mb-1 mt-2 flex justify-between text-[10px] text-neutral-400">
                <span>Disbursement rate</span>
                <span>{totalApproved > 0 ? Math.round((totalDisbursed / totalApproved) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-200">
                <div
                  className="h-1.5 transition-all"
                  style={{
                    width: `${totalApproved > 0 ? Math.min(100, (totalDisbursed / totalApproved) * 100) : 0}%`,
                    background: 'linear-gradient(90deg, #893027, #e0822d)',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Disbursements KPI */}
        <div className="card p-5">
          <h2 className="mb-4 text-xs font-semibold text-neutral-700">Disbursements</h2>
          <div className="space-y-3">
            {[
              { label: 'Completed', value: disbCompleted, dot: '#16a34a' },
              { label: 'Pending / Processing', value: disbPending, dot: '#d97706' },
              { label: 'Failed', value: disbFailed, dot: '#dc2626' },
            ].map(({ label, value, dot }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 flex-shrink-0" style={{ background: dot }} />
                  <span className="text-xs text-neutral-600">{label}</span>
                </div>
                <span className="text-xs font-semibold text-neutral-800">{value}</span>
              </div>
            ))}
            <div className="mt-3 border-t border-neutral-300 pt-3">
              <div className="text-[10px] text-neutral-500 uppercase tracking-[0.4px]">Total Paid Out</div>
              <div className="mt-1 text-sm font-bold text-primary-700">{fmt(disbTotal)} RWF</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Loan Status Breakdown + Products ── */}
      <div className="grid gap-3 lg:grid-cols-3">

        {/* Status breakdown */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="border-b border-neutral-300 px-5 py-3">
            <h2 className="text-xs font-semibold text-neutral-700">Loan Status Breakdown</h2>
          </div>
          {statusBreakdown.length === 0 ? (
            <div className="py-10 text-center text-xs text-neutral-400">No loans yet</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th className="text-right">Count</th>
                  <th className="text-right">Total Requested (RWF)</th>
                  <th className="text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {statusBreakdown.map(({ status, count, amount }) => (
                  <tr key={status}>
                    <td><span className={statusBadge(status)}>{status}</span></td>
                    <td className="text-right font-semibold text-neutral-800">{count}</td>
                    <td className="text-right">{fmt(amount)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 bg-neutral-200">
                          <div
                            className="h-1.5"
                            style={{
                              width: `${Math.round((count / totalLoans) * 100)}%`,
                              background: 'linear-gradient(90deg, #893027, #e0822d)',
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-neutral-500 w-7 text-right">
                          {Math.round((count / totalLoans) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Products + Quick Actions */}
        <div className="space-y-3">
          <div className="card p-5">
            <h2 className="mb-3 text-xs font-semibold text-neutral-700">Products &amp; Access</h2>
            <div className="space-y-2">
              {[
                { label: 'Active Products', value: productCount, action: () => navigate('/products') },
                { label: 'Individual Customers', value: individualCount, action: () => navigate('/customers') },
                { label: 'Business Customers', value: businessCount, action: () => navigate('/customers') },
              ].map(({ label, value, action }) => (
                <div
                  key={label}
                  className="flex cursor-pointer items-center justify-between border-b border-neutral-200 pb-2 last:border-0 last:pb-0 hover:opacity-70 transition"
                  onClick={action}
                >
                  <span className="text-xs text-neutral-600">{label}</span>
                  <span className="text-xs font-bold text-neutral-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-xs font-semibold text-neutral-700">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <button onClick={() => navigate('/loans/new')} className="btn-primary justify-center">
                New Loan Application
              </button>
              <button onClick={() => navigate('/approvals')} className="btn-secondary justify-center">
                Approval Workbench
              </button>
              <button onClick={() => navigate('/disbursements')} className="btn-ghost justify-center">
                Disbursement Queue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Recent Loans + Recent Disbursements ── */}
      <div className="grid gap-3 lg:grid-cols-2">

        {/* Recent Loans */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-300 px-5 py-3">
            <h2 className="text-xs font-semibold text-neutral-700">Recent Loan Applications</h2>
            <button onClick={() => navigate('/loans')} className="text-[10px] font-medium text-primary-700 hover:opacity-70">
              View all →
            </button>
          </div>
          {recentLoans.length === 0 ? (
            <div className="py-10 text-center text-xs text-neutral-400">No applications yet</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loan #</th>
                  <th className="text-right">Amount (RWF)</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLoans.map(l => (
                  <tr
                    key={l.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/loans/${l.id}`)}
                  >
                    <td className="font-medium text-primary-700">{l.loanNumber}</td>
                    <td className="text-right">{fmt(l.requestedAmount)}</td>
                    <td><span className={statusBadge(l.status)}>{l.status}</span></td>
                    <td className="text-neutral-400">{fmtDate(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Disbursements */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-300 px-5 py-3">
            <h2 className="text-xs font-semibold text-neutral-700">Recent Disbursements</h2>
            <button onClick={() => navigate('/disbursements')} className="text-[10px] font-medium text-primary-700 hover:opacity-70">
              View all →
            </button>
          </div>
          {recentDisb.length === 0 ? (
            <div className="py-10 text-center text-xs text-neutral-400">No disbursements yet</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th className="text-right">Amount (RWF)</th>
                  <th>Channel</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDisb.map(d => (
                  <tr
                    key={d.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/disbursements/${d.id}`)}
                  >
                    <td className="font-medium text-neutral-700">{d.disbursementNumber}</td>
                    <td className="text-right">{fmt(d.amount)}</td>
                    <td className="text-neutral-500">{d.channel}</td>
                    <td><span className={statusBadge(d.status)}>{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
