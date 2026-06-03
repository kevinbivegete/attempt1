import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogoMark } from '../components/BrandLogo';

// Sidebar bg: #3f3f46 (charcoal grey matching reference screenshot)
const SB = '#3f3f46';

const navItem = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-[15px] py-4 text-xs font-medium transition-all ${
    isActive
      ? 'border-l-2 border-[#e0822d] bg-black/[0.15] text-white'
      : 'border-l-2 border-transparent text-white/[0.55] hover:bg-black/[0.10] hover:text-white/80'
  }`;


const Divider = () => (
  <div style={{ height: '1px', background: 'rgba(0,0,0,0.15)' }} />
);

const icons = {
  dashboard: (
    <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="0" /><rect x="14" y="3" width="7" height="7" rx="0" />
      <rect x="3" y="14" width="7" height="7" rx="0" /><rect x="14" y="14" width="7" height="7" rx="0" />
    </svg>
  ),
  product: (
    <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
      <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
    </svg>
  ),
  customer: (
    <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  loan: (
    <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  ),
  approval: (
    <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  disbursement: (
    <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  collection: (
    <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  users: (
    <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  settings: (
    <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  analytics: (
    <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  recovery: (
    <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10"/><path d="M16 12l-4 4-4-4"/><path d="M12 8v8"/><path d="M22 12h-6"/>
    </svg>
  ),
  logout: (
    <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
};

export const AppLayout = () => {
  const navigate = useNavigate();
  const { logout, user, hasRole } = useAuth();

  const isSuperAdmin  = hasRole('Super Admin') || hasRole('SUPER_ADMIN');
  const isAdmin       = hasRole('Admin')       || hasRole('ADMIN');
  const isManager     = hasRole('Manager')     || hasRole('MANAGER');
  const isLoanOfficer = hasRole('Loan Officer') || hasRole('LOAN_OFFICER');

  const canManageProducts      = isSuperAdmin || isAdmin;
  const canManageSettings      = isSuperAdmin || isAdmin;
  const canApprove             = isSuperAdmin || isAdmin || isManager;
  const canManageCustomers     = isSuperAdmin || isAdmin || isManager || isLoanOfficer;
  const canManageLoans         = isSuperAdmin || isAdmin || isManager || isLoanOfficer;
  const canManageDisbursements = isSuperAdmin || isAdmin || isManager;
  const canManageCollections   = isSuperAdmin || isAdmin || isManager;

  const role        = user?.roles?.[0] ?? '';
  const initials    = user?.email ? user.email.slice(0, 2).toUpperCase() : '??';
  const displayName = user?.email?.split('@')[0] ?? 'Loading…';

  const handleLogout = async () => {
    try { await logout(); } catch {}
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-primary-100">

      {/* ── Sidebar ── */}
      <aside
        className="sticky top-0 flex h-screen w-[260px] flex-shrink-0 flex-col"
        style={{ background: SB, borderRight: '1px solid rgba(0,0,0,0.15)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center px-[18px] pt-[20px] pb-5">
          <LogoMark size={42} variant="color" />
        </div>

        <Divider />

        {/* Nav — flat list, one consistent gap between every item */}
        <nav className="flex flex-1 flex-col overflow-y-auto py-3">

          <NavLink to="/dashboard" className={navItem}>{icons.dashboard} Dashboard</NavLink>

          {canManageProducts && (
            <NavLink to="/products" className={navItem}>{icons.product} Loan Products</NavLink>
          )}

          {canManageCustomers && (
            <NavLink to="/customers" className={navItem}>{icons.customer} Customer Registry</NavLink>
          )}

          {canManageLoans && (
            <NavLink to="/loans" className={navItem}>{icons.loan} Loan Applications</NavLink>
          )}

          {canApprove && (
            <NavLink to="/approvals" className={navItem}>{icons.approval} Approval Workbench</NavLink>
          )}

          {canManageDisbursements && (
            <NavLink to="/disbursements" className={navItem}>{icons.disbursement} Disbursement Queue</NavLink>
          )}

          {canManageCollections && (
            <NavLink to="/collections" className={navItem}>{icons.collection} Collection Cases</NavLink>
          )}

          {canManageLoans && (
            <NavLink to="/recovery" className={navItem}>{icons.recovery} Recovery &amp; Repayment</NavLink>
          )}

          {(isSuperAdmin || isAdmin || isManager) && (
            <NavLink to="/analytics" className={navItem}>{icons.analytics} Analytics &amp; Reports</NavLink>
          )}

          {canManageSettings && (
            <NavLink to="/settings/users" className={navItem}>{icons.users} Users &amp; Roles</NavLink>
          )}

          {canManageSettings && (
            <NavLink to="/settings/fsp" className={navItem}>{icons.settings} FSP Settings</NavLink>
          )}

        </nav>

        {/* Bottom — user info + sign out */}
        <div className="px-[18px] pb-[18px]">
          <Divider />
          <div className="flex items-center gap-3 px-[15px] py-4">
            <div
              className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center text-xs font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #893027 0%, #e0822d 100%)',
                boxShadow: '0 3px 16px 0 #a852054d',
              }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-white">{displayName}</div>
              <div className="truncate text-[10px] text-white/[0.30]">{role}</div>
            </div>
          </div>
          <Divider />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 border-l-2 border-transparent px-[15px] py-3 text-xs font-medium text-white/[0.40] transition-all hover:bg-white/[0.03] hover:text-white/70"
          >
            {icons.logout} Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
