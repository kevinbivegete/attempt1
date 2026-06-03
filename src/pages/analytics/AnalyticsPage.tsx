import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { loanService, Loan } from '../../services/loan.service';
import { disbursementService, Disbursement } from '../../services/disbursement.service';
import { customerService } from '../../services/customer.service';
import { productService } from '../../services/product.service';

const ORANGE  = '#e0822d';
const DARK    = '#893027';
const GREY    = '#a1a1aa';
const GREEN   = '#16a34a';
const RED     = '#dc2626';
const AMBER   = '#d97706';

const STATUS_COLORS: Record<string, string> = {
  Pending:   AMBER,
  Submitted: '#3b82f6',
  Approved:  GREEN,
  Rejected:  RED,
  Disbursed: ORANGE,
  Active:    '#10b981',
  Closed:    GREY,
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-RW', { minimumFractionDigits: 0 }).format(n);

const fmtM = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const monthKey = (d: string) => {
  const dt = new Date(d);
  return `${MONTH_LABELS[dt.getMonth()]} ${dt.getFullYear()}`;
};

export const AnalyticsPage = () => {
  const [loans, setLoans]               = useState<Loan[]>([]);
  const [disbs, setDisbs]               = useState<Disbursement[]>([]);
  const [indCount, setIndCount]         = useState(0);
  const [bizCount, setBizCount]         = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [l, d, ind, biz, prods] = await Promise.all([
          loanService.findAll(),
          disbursementService.findAll().catch(() => [] as Disbursement[]),
          customerService.findAll().catch(() => []),
          customerService.findAllBusiness().catch(() => []),
          productService.findAll().catch(() => []),
        ]);
        setLoans(l);
        setDisbs(d);
        setIndCount(ind.length);
        setBizCount(biz.length);
        setProductCount(prods.length);
      } catch {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-xs text-neutral-500">Loading analytics…</div>
  );
  if (error) return (
    <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>
  );

  /* ── Derived metrics ── */
  const totalLoans      = loans.length;
  const approvedLoans   = loans.filter(l => l.status === 'Approved' || l.status === 'Disbursed' || l.status === 'Active').length;
  const rejectedLoans   = loans.filter(l => l.status === 'Rejected').length;
  const approvalRate    = totalLoans ? Math.round((approvedLoans / totalLoans) * 100) : 0;
  const totalRequested  = loans.reduce((s, l) => s + l.requestedAmount, 0);
  const totalApproved   = loans.reduce((s, l) => s + (l.approvedAmount ?? 0), 0);
  const totalDisbursed  = loans.reduce((s, l) => s + (l.disbursedAmount ?? 0), 0);
  const avgLoanAmount   = totalLoans ? Math.round(totalRequested / totalLoans) : 0;
  const avgTenure       = totalLoans ? Math.round(loans.reduce((s, l) => s + l.tenureMonths, 0) / totalLoans) : 0;
  const disbCompleted   = disbs.filter(d => d.status === 'Completed').length;
  const disbRate        = disbs.length ? Math.round((disbCompleted / disbs.length) * 100) : 0;

  /* ── Loan volume by month ── */
  const monthMap: Record<string, { month: string; count: number; amount: number }> = {};
  loans.forEach(l => {
    const k = monthKey(l.createdAt);
    if (!monthMap[k]) monthMap[k] = { month: k, count: 0, amount: 0 };
    monthMap[k].count++;
    monthMap[k].amount += l.requestedAmount;
  });
  const loanByMonth = Object.values(monthMap).slice(-8);

  /* ── Status distribution for pie ── */
  const statusMap: Record<string, number> = {};
  loans.forEach(l => { statusMap[l.status] = (statusMap[l.status] ?? 0) + 1; });
  const statusPie = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  /* ── Disbursement trend by month ── */
  const disbMonthMap: Record<string, { month: string; amount: number; count: number }> = {};
  disbs.filter(d => d.status === 'Completed').forEach(d => {
    const k = monthKey(d.createdAt);
    if (!disbMonthMap[k]) disbMonthMap[k] = { month: k, amount: 0, count: 0 };
    disbMonthMap[k].amount += d.amount;
    disbMonthMap[k].count++;
  });
  const disbByMonth = Object.values(disbMonthMap).slice(-8);

  /* ── Portfolio breakdown bar ── */
  const portfolioBar = [
    { name: 'Requested', value: totalRequested },
    { name: 'Approved',  value: totalApproved  },
    { name: 'Disbursed', value: totalDisbursed  },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header mb-0">
        <h1 className="page-title">Analytics &amp; Reports</h1>
        <p className="page-subtitle">Live insights across loans, disbursements, and customers.</p>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Approval Rate',       value: `${approvalRate}%`,        sub: `${approvedLoans} of ${totalLoans} applications`,  color: 'text-success' },
          { label: 'Avg Loan Amount',     value: `${fmtM(avgLoanAmount)} RWF`, sub: `Across ${totalLoans} applications`,            color: 'text-neutral-800' },
          { label: 'Avg Tenure',          value: `${avgTenure} months`,     sub: 'Average loan term',                               color: 'text-neutral-800' },
          { label: 'Disbursement Rate',   value: `${disbRate}%`,            sub: `${disbCompleted} of ${disbs.length} completed`,   color: 'text-primary-700' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="stat-card">
            <div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-neutral-500">{label}</div>
            <div className={`mt-2 text-2xl font-bold ${color}`}>{value}</div>
            <div className="mt-1 text-[10px] text-neutral-400">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Loan volume by month + Status pie ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-xs font-semibold text-neutral-700">Loan Applications by Month</h2>
          {loanByMonth.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-neutral-400">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={loanByMonth} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, border: '1px solid #d4d4d8', borderRadius: 0 }}
                  formatter={(v: number) => [v, 'Applications']}
                />
                <Bar dataKey="count" fill={ORANGE} radius={0} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-xs font-semibold text-neutral-700">Status Distribution</h2>
          {statusPie.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-neutral-400">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusPie}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPie.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? GREY} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #d4d4d8', borderRadius: 0 }} />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Row 3: Portfolio bar + Disbursement trend ── */}
      <div className="grid gap-4 lg:grid-cols-2">

        <div className="card p-5">
          <h2 className="mb-4 text-xs font-semibold text-neutral-700">Portfolio Overview (RWF)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={portfolioBar} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip
                contentStyle={{ fontSize: 11, border: '1px solid #d4d4d8', borderRadius: 0 }}
                formatter={(v: number) => [`${fmt(v)} RWF`]}
              />
              <Bar dataKey="value" radius={0}>
                {portfolioBar.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.name === 'Requested' ? GREY : entry.name === 'Approved' ? GREEN : ORANGE}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-xs font-semibold text-neutral-700">Disbursement Volume by Month (RWF)</h2>
          {disbByMonth.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-neutral-400">No completed disbursements yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={disbByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
                <Tooltip
                  contentStyle={{ fontSize: 11, border: '1px solid #d4d4d8', borderRadius: 0 }}
                  formatter={(v: number) => [`${fmt(v)} RWF`, 'Disbursed']}
                />
                <Line type="monotone" dataKey="amount" stroke={DARK} strokeWidth={2} dot={{ fill: ORANGE, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Row 4: Summary stats table + Customer split ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        <div className="card overflow-hidden lg:col-span-2">
          <div className="border-b border-neutral-300 px-5 py-3">
            <h2 className="text-xs font-semibold text-neutral-700">Loan Status Summary</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th className="text-right">Count</th>
                <th className="text-right">Total Requested (RWF)</th>
                <th className="text-right">Total Approved (RWF)</th>
                <th className="text-right">% of Portfolio</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(statusMap).map(([status, count]) => {
                const statusLoans = loans.filter(l => l.status === status);
                const req = statusLoans.reduce((s, l) => s + l.requestedAmount, 0);
                const app = statusLoans.reduce((s, l) => s + (l.approvedAmount ?? 0), 0);
                return (
                  <tr key={status}>
                    <td>
                      <span
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-white"
                        style={{ background: STATUS_COLORS[status] ?? GREY }}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="text-right font-semibold text-neutral-800">{count}</td>
                    <td className="text-right">{fmt(req)}</td>
                    <td className="text-right">{app > 0 ? fmt(app) : '—'}</td>
                    <td className="text-right text-neutral-500">
                      {Math.round((count / totalLoans) * 100)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3">
          <div className="card p-5">
            <h2 className="mb-4 text-xs font-semibold text-neutral-700">Customer Base</h2>
            <div className="space-y-3">
              {[
                { label: 'Individual Customers', value: indCount, color: ORANGE },
                { label: 'Business Customers',   value: bizCount, color: DARK   },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-[10px]">
                    <span className="text-neutral-600">{label}</span>
                    <span className="font-semibold text-neutral-800">{value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-200">
                    <div
                      className="h-1.5 transition-all"
                      style={{
                        background: color,
                        width: indCount + bizCount > 0
                          ? `${Math.round((value / (indCount + bizCount)) * 100)}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="border-t border-neutral-200 pt-3 text-xs font-bold text-neutral-800">
                Total: {indCount + bizCount}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-xs font-semibold text-neutral-700">Platform Stats</h2>
            <div className="space-y-2">
              {[
                { label: 'Active Products',       value: productCount },
                { label: 'Total Disbursements',   value: disbs.length },
                { label: 'Rejected Applications', value: rejectedLoans },
                { label: 'Portfolio Value (RWF)', value: fmtM(totalApproved) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between border-b border-neutral-100 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-[10px] text-neutral-500">{label}</span>
                  <span className="text-xs font-semibold text-neutral-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
