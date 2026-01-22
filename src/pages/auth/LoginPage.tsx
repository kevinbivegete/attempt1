import { useNavigate, Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage, getFieldErrors } from '../../utils/errorHandler';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const emailInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    // Clear previous errors
    setError(null);
    setFieldErrors({});

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      // Only navigate on success
      navigate('/dashboard');
    } catch (err: any) {
      // Keep form data populated - don't clear it
      const errorMessage = getErrorMessage(err);
      const fieldErrs = getFieldErrors(err);

      // If there are field-specific errors, use those; otherwise use general error
      if (Object.keys(fieldErrs).length > 0) {
        setFieldErrors(fieldErrs);
      } else {
        // Show a clear, user-friendly error message
        const finalErrorMessage =
          errorMessage ||
          'Invalid email or password. Please check your credentials and try again.';
        setError(finalErrorMessage);
      }

      // Focus on email field for better UX
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-8 shadow-xl shadow-slate-900/10 dark:shadow-slate-900/60">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-slate-950 text-lg font-bold">
            FL
          </div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            FSP Portal Login
          </h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Sign in to manage products, loan applications, and disbursements.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              ref={emailInputRef}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              className={`w-full rounded-md border ${
                fieldErrors.email || error
                  ? 'border-rose-500 dark:border-rose-500'
                  : 'border-slate-300 dark:border-slate-700'
              } bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
              placeholder="user@example.com"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.email}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              className={`w-full rounded-md border ${
                fieldErrors.password || error
                  ? 'border-rose-500 dark:border-rose-500'
                  : 'border-slate-300 dark:border-slate-700'
              } bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
              placeholder="••••••••"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.password}
              </p>
            )}
          </div>
          {error && (
            <div className="rounded-md bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-300 dark:border-rose-700 px-3 py-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <svg
                  className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="font-medium">{error}</p>
                  <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                    Please check your email and password, then try again.
                  </p>
                </div>
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-md bg-primary-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};
