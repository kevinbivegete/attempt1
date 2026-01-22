import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

const navItemClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary-500 text-slate-950 dark:text-slate-950'
      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
  }`;

export const AppLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <aside className="flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-slate-950 font-bold">
            FL
          </div>
          <div>
            <div className="text-sm font-semibold">FairLending</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              FSP Portal
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-2 px-3 py-4 text-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500 px-2">
            Overview
          </div>
          <NavLink to="/dashboard" className={navItemClasses}>
            Dashboard
          </NavLink>

          <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500 px-2">
            Product Management
          </div>
          <NavLink to="/products" className={navItemClasses}>
            Products
          </NavLink>

          <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500 px-2">
            Origination
          </div>
          <NavLink to="/loans" className={navItemClasses}>
            Loan Applications
          </NavLink>
          <NavLink to="/approvals" className={navItemClasses}>
            Approval Workbench
          </NavLink>

          <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500 px-2">
            Disbursement
          </div>
          <NavLink to="/disbursements" className={navItemClasses}>
            Disbursement Queue
          </NavLink>

          <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500 px-2">
            Settings
          </div>
          <NavLink to="/settings/users" className={navItemClasses}>
            Users & Roles
          </NavLink>
          <NavLink to="/settings/fsp" className={navItemClasses}>
            FSP Settings
          </NavLink>
        </nav>
        <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-200">
                Demo User
              </div>
              <div>Role: Loan Officer</div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded-md bg-slate-200 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 px-6 py-3 backdrop-blur">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              FSP Operations Dashboard
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Loan products, origination, approvals & disbursements
            </div>
          </div>
          <ThemeToggle />
        </header>
        <section className="px-6 py-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
};
