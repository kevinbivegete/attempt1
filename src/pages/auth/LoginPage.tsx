import { useNavigate, Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage, getFieldErrors } from '../../utils/errorHandler';
import { LogoMark } from '../../components/BrandLogo';

const SB = '#3f3f46'; // sidebar grey — single source of truth

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ email: '', password: '' });
  const emailInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email address';
    if (!formData.password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    if (!validateForm()) return;
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      const fieldErrs = getFieldErrors(err);
      if (Object.keys(fieldErrs).length > 0) {
        setFieldErrors(fieldErrs);
      } else {
        setError(getErrorMessage(err) || 'Invalid email or password. Please try again.');
      }
      setTimeout(() => emailInputRef.current?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen" style={{ background: SB }}>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between min-h-screen px-16 py-14"
        style={{
          background: `linear-gradient(160deg, #48484f 0%, ${SB} 60%)`,
          borderRight: '1px solid rgba(0,0,0,0.15)',
        }}
      >
        {/* Top: logo mark */}
        <div>
          <div
            className="flex h-10 w-10 items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #893027 0%, #e0822d 100%)',
              boxShadow: '0 3px 16px 0 #a852054d',
            }}
          >
            <LogoMark size={28} variant="white" />
          </div>
        </div>

        {/* Center: headline */}
        <div>
          <div
            className="mb-6 inline-flex items-center gap-2 px-3 py-1.5"
            style={{ background: 'rgba(224,130,45,0.14)', border: '1px solid rgba(224,130,45,0.25)' }}
          >
            <div className="h-1.5 w-1.5" style={{ background: '#e0822d' }} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.5px] text-white/[0.65]">
              BNR Compliant · Rwanda
            </span>
          </div>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-white">
            Smarter lending,<br />built for Rwanda.
          </h2>
          <p className="mb-10 text-xs leading-relaxed text-white/[0.50]">
            End-to-end loan management for financial service providers —
            origination, approvals, disbursements, and collections in one place.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Loan Products', desc: 'Configure & manage' },
              { label: 'Origination', desc: 'Fast loan processing' },
              { label: 'Approvals', desc: 'Workflow-based' },
              { label: 'Collections', desc: 'Delinquency tracking' },
            ].map((f) => (
              <div
                key={f.label}
                className="p-4"
                style={{ background: 'rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.15)' }}
              >
                <div className="mb-0.5 text-xs font-semibold text-white">{f.label}</div>
                <div className="text-[10px] text-white/[0.40]">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: version */}
        <div className="text-[10px] text-white/[0.22]">FairLending v1.0 · © 2025</div>
      </div>

      {/* ── Right: login form ── */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center lg:hidden">
            <div
              className="flex h-9 w-9 items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #893027 0%, #e0822d 100%)',
                boxShadow: '0 3px 16px 0 #a852054d',
              }}
            >
              <LogoMark size={24} variant="white" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-lg font-bold text-white">Welcome back</h1>
            <p className="mt-1 text-[10px] text-white/[0.45]">
              Sign in to access the FSP operations portal.
            </p>
          </div>

          {/* Form card */}
          <div
            className="p-7"
            style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.20)' }}
          >
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              <div>
                <label
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.4px]"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  Email address
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  placeholder="you@example.com"
                  style={{
                    background: 'rgba(0,0,0,0.18)',
                    border: fieldErrors.email
                      ? '1px solid #dc2626'
                      : '1px solid rgba(0,0,0,0.25)',
                    color: '#ffffff',
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                  className="placeholder:text-white/[0.25] focus:border-[#e0822d] transition"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-[10px] text-danger">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.4px]"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{
                    background: 'rgba(0,0,0,0.18)',
                    border: fieldErrors.password
                      ? '1px solid #dc2626'
                      : '1px solid rgba(0,0,0,0.25)',
                    color: '#ffffff',
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                  className="placeholder:text-white/[0.25] focus:border-[#e0822d] transition"
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-[10px] text-danger">{fieldErrors.password}</p>
                )}
              </div>

              {error && (
                <div
                  className="flex items-start gap-2.5 px-4 py-3"
                  style={{ background: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.25)' }}
                >
                  <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-danger" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-[10px] text-danger">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-700 hover:opacity-80">
                Create account
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
            FairLending · BNR Compliant · Rwanda
          </p>
        </div>
      </div>
    </div>
  );
};
