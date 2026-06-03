import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { customerService, CreateIndividualPayload } from '../../services/customer.service';
import { getErrorMessage } from '../../utils/errorHandler';

const PROVINCES = ['Kigali City', 'Eastern Province', 'Northern Province', 'Southern Province', 'Western Province'];

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
];

const MARITAL_OPTIONS = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
];

type FormData = {
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  national_id: string;
  phone: string;
  email: string;
  physical_address: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
};

const empty: FormData = {
  first_name: '',
  middle_name: '',
  last_name: '',
  date_of_birth: '',
  gender: '',
  marital_status: '',
  national_id: '',
  phone: '',
  email: '',
  physical_address: '',
  province: '',
  district: '',
  sector: '',
  cell: '',
  village: '',
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-400">{children}</h2>
);

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1 text-xs text-danger">{msg}</p> : null;

export const IndividualCustomerFormPage = () => {
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

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.first_name.trim()) e.first_name = 'Required';
    if (!form.last_name.trim()) e.last_name = 'Required';
    if (!form.date_of_birth) e.date_of_birth = 'Required';
    if (!form.gender) e.gender = 'Required';
    if (!form.marital_status) e.marital_status = 'Required';
    if (!form.national_id.trim()) e.national_id = 'Required';
    else if (!/^\d{16}$/.test(form.national_id.replace(/\s/g, ''))) e.national_id = 'Must be 16 digits';
    if (!form.phone.trim()) e.phone = 'Required';
    else if (!/^(\+?250|0)?[0-9]{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid Rwandan phone number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.physical_address.trim()) e.physical_address = 'Required';
    if (!form.province) e.province = 'Required';
    if (!form.district.trim()) e.district = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: CreateIndividualPayload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        marital_status: form.marital_status,
        national_id: form.national_id.replace(/\s/g, ''),
        phone: form.phone.trim(),
        physical_address: form.physical_address.trim(),
        province: form.province,
        district: form.district.trim(),
      };
      if (form.middle_name.trim()) payload.middle_name = form.middle_name.trim();
      if (form.email.trim()) payload.email = form.email.trim();
      if (form.sector.trim()) payload.sector = form.sector.trim();
      if (form.cell.trim()) payload.cell = form.cell.trim();
      if (form.village.trim()) payload.village = form.village.trim();

      const created = await customerService.createIndividual(payload);
      navigate(`/customers/${created.id}`);
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
        <h1 className="page-title">Register Individual Customer</h1>
        <p className="page-subtitle">Create a new individual customer record</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Personal Information */}
        <div className="card p-6">
          <SectionTitle>Personal Information</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="form-label">First Name <span className="text-danger">*</span></label>
              <input type="text" value={form.first_name} onChange={set('first_name')} className={inp('first_name')} placeholder="Jean" />
              <FieldError msg={errors.first_name} />
            </div>
            <div>
              <label className="form-label">Middle Name</label>
              <input type="text" value={form.middle_name} onChange={set('middle_name')} className="form-input" placeholder="Optional" />
            </div>
            <div>
              <label className="form-label">Last Name <span className="text-danger">*</span></label>
              <input type="text" value={form.last_name} onChange={set('last_name')} className={inp('last_name')} placeholder="Mutabazi" />
              <FieldError msg={errors.last_name} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
              <input type="date" value={form.date_of_birth} onChange={set('date_of_birth')} className={inp('date_of_birth')} max={new Date().toISOString().split('T')[0]} />
              <FieldError msg={errors.date_of_birth} />
            </div>
            <div>
              <label className="form-label">Gender <span className="text-danger">*</span></label>
              <select value={form.gender} onChange={set('gender')} className={`form-select ${errors.gender ? 'border-danger ring-2 ring-rose-100' : ''}`}>
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <FieldError msg={errors.gender} />
            </div>
            <div>
              <label className="form-label">Marital Status <span className="text-danger">*</span></label>
              <select value={form.marital_status} onChange={set('marital_status')} className={`form-select ${errors.marital_status ? 'border-danger ring-2 ring-rose-100' : ''}`}>
                <option value="">Select status</option>
                {MARITAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <FieldError msg={errors.marital_status} />
            </div>
          </div>
        </div>

        {/* Identity & Contact */}
        <div className="card p-6">
          <SectionTitle>Identity & Contact</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">National ID Number <span className="text-danger">*</span></label>
              <input
                type="text"
                value={form.national_id}
                onChange={set('national_id')}
                className={inp('national_id')}
                placeholder="1199012345678901"
                maxLength={16}
              />
              <p className="mt-1 text-xs text-neutral-400">16-digit Rwanda national ID</p>
              <FieldError msg={errors.national_id} />
            </div>
            <div>
              <label className="form-label">Phone Number <span className="text-danger">*</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                className={inp('phone')}
                placeholder="+250 78 123 4567"
              />
              <FieldError msg={errors.phone} />
            </div>
          </div>

          <div className="mt-4">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              className={inp('email')}
              placeholder="jean@example.com (optional)"
            />
            <FieldError msg={errors.email} />
          </div>
        </div>

        {/* Address */}
        <div className="card p-6">
          <SectionTitle>Residential Address</SectionTitle>
          <div className="mb-4">
            <label className="form-label">Physical Address <span className="text-danger">*</span></label>
            <textarea
              value={form.physical_address}
              onChange={set('physical_address')}
              rows={2}
              className={`form-input resize-none ${errors.physical_address ? 'border-danger ring-2 ring-rose-100' : ''}`}
              placeholder="Street / house number / area..."
            />
            <FieldError msg={errors.physical_address} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="form-label">Province <span className="text-danger">*</span></label>
              <select value={form.province} onChange={set('province')} className={`form-select ${errors.province ? 'border-danger ring-2 ring-rose-100' : ''}`}>
                <option value="">Select province</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <FieldError msg={errors.province} />
            </div>
            <div>
              <label className="form-label">District <span className="text-danger">*</span></label>
              <input type="text" value={form.district} onChange={set('district')} className={inp('district')} placeholder="e.g. Gasabo" />
              <FieldError msg={errors.district} />
            </div>
            <div>
              <label className="form-label">Sector</label>
              <input type="text" value={form.sector} onChange={set('sector')} className="form-input" placeholder="e.g. Kimironko" />
            </div>
            <div>
              <label className="form-label">Cell</label>
              <input type="text" value={form.cell} onChange={set('cell')} className="form-input" placeholder="e.g. Bibare" />
            </div>
            <div>
              <label className="form-label">Village</label>
              <input type="text" value={form.village} onChange={set('village')} className="form-input" placeholder="e.g. Amahoro" />
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
            {loading ? 'Registering...' : 'Register Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};
