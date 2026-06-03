import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { customerService, CreateBusinessPayload } from '../../services/customer.service';
import { getErrorMessage } from '../../utils/errorHandler';

const PROVINCES = ['Kigali City', 'Eastern Province', 'Northern Province', 'Southern Province', 'Western Province'];

const BUSINESS_TYPES = [
  { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'LIMITED_COMPANY', label: 'Limited Company' },
  { value: 'CORPORATION', label: 'Corporation' },
  { value: 'NGO', label: 'NGO' },
  { value: 'COOPERATIVE', label: 'Cooperative' },
];

const INDUSTRIES = [
  'Agriculture',
  'Manufacturing',
  'Construction',
  'Retail & Trade',
  'Hospitality & Tourism',
  'Transport & Logistics',
  'Education',
  'Healthcare',
  'Technology & ICT',
  'Financial Services',
  'Real Estate',
  'Energy & Utilities',
  'Other',
];

type FormData = {
  company_name: string;
  trading_name: string;
  registration_number: string;
  tin: string;
  business_type: string;
  industry: string;
  date_of_incorporation: string;
  business_address: string;
  province: string;
  district: string;
  sector: string;
  phone: string;
  email: string;
  website: string;
};

const empty: FormData = {
  company_name: '',
  trading_name: '',
  registration_number: '',
  tin: '',
  business_type: '',
  industry: '',
  date_of_incorporation: '',
  business_address: '',
  province: '',
  district: '',
  sector: '',
  phone: '',
  email: '',
  website: '',
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-400">{children}</h2>
);

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1 text-xs text-danger">{msg}</p> : null;

export const BusinessCustomerFormPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const inp = (field: keyof FormData) =>
    `form-input ${errors[field] ? 'border-danger ring-2 ring-rose-100' : ''}`;

  const sel = (field: keyof FormData) =>
    `form-select ${errors[field] ? 'border-danger ring-2 ring-rose-100' : ''}`;

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.company_name.trim()) e.company_name = 'Required';
    if (!form.registration_number.trim()) e.registration_number = 'Required';
    if (!form.tin.trim()) e.tin = 'Required';
    else if (!/^\d{9}$/.test(form.tin.replace(/\s/g, ''))) e.tin = 'TIN must be 9 digits';
    if (!form.business_type) e.business_type = 'Required';
    if (!form.industry) e.industry = 'Required';
    if (!form.date_of_incorporation) e.date_of_incorporation = 'Required';
    if (!form.business_address.trim()) e.business_address = 'Required';
    if (!form.province) e.province = 'Required';
    if (!form.district.trim()) e.district = 'Required';
    if (!form.sector.trim()) e.sector = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    else if (!/^(\+?250|0)?[0-9]{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid Rwandan phone number';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: CreateBusinessPayload = {
        company_name: form.company_name.trim(),
        registration_number: form.registration_number.trim(),
        tin: form.tin.replace(/\s/g, ''),
        business_type: form.business_type,
        industry: form.industry,
        date_of_incorporation: form.date_of_incorporation,
        business_address: form.business_address.trim(),
        province: form.province,
        district: form.district.trim(),
        sector: form.sector.trim(),
        phone_number: form.phone.trim(),
        email: form.email.trim(),
      };
      if (form.trading_name.trim()) payload.trading_name = form.trading_name.trim();
      if (form.website.trim()) payload.website = form.website.trim();

      const created = await customerService.createBusiness(payload);
      navigate(`/customers/business/${created.id}`);
    } catch (err: any) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/customers" className="mb-2 inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-primary-700 transition">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Customer Registry
        </Link>
        <h1 className="page-title">Register Business Customer</h1>
        <p className="page-subtitle">Create a new business / corporate customer record</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Business Identity */}
        <div className="card p-6">
          <SectionTitle>Business Identity</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Company Name <span className="text-danger">*</span></label>
              <input type="text" value={form.company_name} onChange={set('company_name')} className={inp('company_name')} placeholder="Akagera Enterprises Ltd" />
              <FieldError msg={errors.company_name} />
            </div>
            <div>
              <label className="form-label">Trading Name</label>
              <input type="text" value={form.trading_name} onChange={set('trading_name')} className="form-input" placeholder="Optional (if different from company name)" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="form-label">Registration Number <span className="text-danger">*</span></label>
              <input type="text" value={form.registration_number} onChange={set('registration_number')} className={inp('registration_number')} placeholder="e.g. 100012345" />
              <FieldError msg={errors.registration_number} />
            </div>
            <div>
              <label className="form-label">TIN Number <span className="text-danger">*</span></label>
              <input
                type="text"
                value={form.tin}
                onChange={set('tin')}
                className={inp('tin')}
                placeholder="123456789"
                maxLength={9}
              />
              <p className="mt-1 text-xs text-neutral-400">9-digit Rwanda TIN</p>
              <FieldError msg={errors.tin} />
            </div>
            <div>
              <label className="form-label">Date of Incorporation <span className="text-danger">*</span></label>
              <input type="date" value={form.date_of_incorporation} onChange={set('date_of_incorporation')} className={inp('date_of_incorporation')} max={new Date().toISOString().split('T')[0]} />
              <FieldError msg={errors.date_of_incorporation} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Business Type <span className="text-danger">*</span></label>
              <select value={form.business_type} onChange={set('business_type')} className={sel('business_type')}>
                <option value="">Select type</option>
                {BUSINESS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <FieldError msg={errors.business_type} />
            </div>
            <div>
              <label className="form-label">Industry / Sector <span className="text-danger">*</span></label>
              <select value={form.industry} onChange={set('industry')} className={sel('industry')}>
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <FieldError msg={errors.industry} />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card p-6">
          <SectionTitle>Contact Information</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="form-label">Phone Number <span className="text-danger">*</span></label>
              <input type="tel" value={form.phone} onChange={set('phone')} className={inp('phone')} placeholder="+250 78 123 4567" />
              <FieldError msg={errors.phone} />
            </div>
            <div>
              <label className="form-label">Email Address <span className="text-danger">*</span></label>
              <input type="email" value={form.email} onChange={set('email')} className={inp('email')} placeholder="info@company.rw" />
              <FieldError msg={errors.email} />
            </div>
            <div>
              <label className="form-label">Website</label>
              <input type="url" value={form.website} onChange={set('website')} className="form-input" placeholder="https://company.rw (optional)" />
            </div>
          </div>
        </div>

        {/* Business Address */}
        <div className="card p-6">
          <SectionTitle>Business Address</SectionTitle>
          <div className="mb-4">
            <label className="form-label">Business Address <span className="text-danger">*</span></label>
            <textarea
              value={form.business_address}
              onChange={set('business_address')}
              rows={2}
              className={`form-input resize-none ${errors.business_address ? 'border-danger ring-2 ring-rose-100' : ''}`}
              placeholder="Street / plot number / building..."
            />
            <FieldError msg={errors.business_address} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="form-label">Province <span className="text-danger">*</span></label>
              <select value={form.province} onChange={set('province')} className={sel('province')}>
                <option value="">Select province</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <FieldError msg={errors.province} />
            </div>
            <div>
              <label className="form-label">District <span className="text-danger">*</span></label>
              <input type="text" value={form.district} onChange={set('district')} className={inp('district')} placeholder="e.g. Nyarugenge" />
              <FieldError msg={errors.district} />
            </div>
            <div>
              <label className="form-label">Sector <span className="text-danger">*</span></label>
              <input type="text" value={form.sector} onChange={set('sector')} className={inp('sector')} placeholder="e.g. Nyarugenge" />
              <FieldError msg={errors.sector} />
            </div>
          </div>
        </div>

        {/* Error */}
        {submitError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-xs text-rose-700">{submitError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link to="/customers" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Registering...' : 'Register Business'}
          </button>
        </div>
      </form>
    </div>
  );
};
