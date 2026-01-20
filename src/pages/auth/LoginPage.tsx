import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'Admin' | 'Loan Officer' | 'Ops'>(
    'Loan Officer',
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: hook into real auth API; for now just redirect
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/60">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-slate-950 text-lg font-bold">
            LM
          </div>
          <h1 className="text-lg font-semibold text-white">FSP Portal Login</h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to manage products, loan applications, and disbursements.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Email or Username
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Role (for demo)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option>Admin</option>
              <option>Loan Officer</option>
              <option>Ops</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center rounded-md bg-primary-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-primary-400"
          >
            Sign in
          </button>
        </form>
        <p className="mt-4 text-center text-[11px] text-slate-500">
          Demo only – plug into your IAM / SSO later.
        </p>
      </div>
    </div>
  );
};
