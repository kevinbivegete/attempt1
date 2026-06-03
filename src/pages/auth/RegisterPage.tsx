import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage, getFieldErrors } from '../../utils/errorHandler';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    tenantId: '00000000-0000-0000-0000-000000000001',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;
    if (!formData.firstName.trim()) { errors.firstName = 'First name is required'; isValid = false; }
    else if (formData.firstName.trim().length < 2) { errors.firstName = 'At least 2 characters'; isValid = false; }
    if (!formData.lastName.trim()) { errors.lastName = 'Last name is required'; isValid = false; }
    else if (formData.lastName.trim().length < 2) { errors.lastName = 'At least 2 characters'; isValid = false; }
    if (!formData.email.trim()) { errors.email = 'Email is required'; isValid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { errors.email = 'Enter a valid email'; isValid = false; }
    if (!formData.password) { errors.password = 'Password is required'; isValid = false; }
    else if (formData.password.length < 8) { errors.password = 'At least 8 characters'; isValid = false; }
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) { errors.password = 'Must contain uppercase, lowercase, and number'; isValid = false; }
    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    if (!validateForm()) return;
    setLoading(true);
    try {
      await register(formData.tenantId, formData.email, formData.password, formData.firstName, formData.lastName);
      navigate('/dashboard');
    } catch (err: any) {
      const fieldErrs = getFieldErrors(err);
      if (Object.keys(fieldErrs).length > 0) setFieldErrors(fieldErrs);
      else setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-100">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-primary-700 min-h-screen px-16 shadow-purple">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <span className="text-2xl font-bold text-white">FL</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">FairLending</h2>
          <p className="text-primary-300 text-base leading-relaxed">
            BNR-compliant loan management platform for Rwanda's financial service providers.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-700 shadow-purple">
              <span className="text-sm font-bold text-white">FL</span>
            </div>
            <div>
              <div className="text-base font-bold text-neutral-800">FairLending</div>
              <div className="text-xs text-neutral-400">FSP Portal</div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-800">Create account</h1>
            <p className="mt-1.5 text-sm text-neutral-500">Register to access the FSP portal.</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className={`form-input ${fieldErrors.firstName ? 'border-danger ring-2 ring-rose-100' : ''}`}
                  />
                  {fieldErrors.firstName && <p className="mt-1 text-xs text-danger">{fieldErrors.firstName}</p>}
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    className={`form-input ${fieldErrors.lastName ? 'border-danger ring-2 ring-rose-100' : ''}`}
                  />
                  {fieldErrors.lastName && <p className="mt-1 text-xs text-danger">{fieldErrors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`form-input ${fieldErrors.email ? 'border-danger ring-2 ring-rose-100' : ''}`}
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`form-input ${fieldErrors.password ? 'border-danger ring-2 ring-rose-100' : ''}`}
                />
                {fieldErrors.password
                  ? <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>
                  : <p className="mt-1 text-xs text-neutral-400">Min. 8 characters with uppercase, lowercase, and number.</p>
                }
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-xs text-rose-700">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-sm">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-neutral-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-600">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-neutral-400">
            FairLending · BNR Compliant · Rwanda 🇷🇼
          </p>
        </div>
      </div>
    </div>
  );
};
