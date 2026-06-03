# FairLending FSP Portal — Frontend

A BNR-compliant, multi-tenant loan management web application for Rwanda's financial service providers. Built with React 18 + TypeScript + Vite + Tailwind CSS.

---

## Features

- **Dashboard** — Real-time portfolio metrics and charts for at-a-glance loan book health
- **Customer Registry** — Individual and Business customer management with full profile detail views
- **Loan Origination** — Application creation, eligibility check, submit-for-approval workflow; Approval Workbench for managers
- **Disbursement Queue** — Approved loans ready to disburse; transaction tracking with retry and reversal support
- **Recovery & Repayment** — Repayment schedule setup (Daily / Weekly / Bi-Weekly / Monthly / Quarterly / Custom), installment tracking, payment recording, and schedule revision requests with approval flow
- **Collections** — Delinquency case management, activity logging (promise-to-pay, write-offs, field visits)
- **Analytics & Reports** — Financial analysis with extensive date/product/status filters, 6 chart types (line, bar, area, pie, composed, scatter), 8 KPI metric cards
- **RBAC** — Role-based access control: Super Admin, Admin, Manager, Loan Officer, User

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Language | TypeScript 5 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3 |
| Routing | React Router 6 |
| Charts | Recharts |
| HTTP Client | Axios (with JWT refresh interceptors) |
| Forms | React Hook Form + Zod |
| Font | Poppins (Google Fonts) |

---

## Design System

| Token | Value |
|---|---|
| Sidebar background | `#3f3f46` (dark grey) |
| Content area background | `#d9d9d9` (light grey) |
| Primary accent | `#e0822d` (orange) |
| Danger / secondary accent | `#893027` (dark red) |
| Body font | Poppins, 12px |
| Border radius | None — square edges throughout |

---

## Architecture

```
src/
├── App.tsx                 # Route definitions and RBAC guards
├── main.tsx                # Entry point
├── index.css               # Global styles, Tailwind directives
├── layouts/
│   └── AppLayout.tsx       # Sidebar + top bar shell
├── contexts/
│   ├── AuthContext.tsx      # JWT auth state, login/logout, profile
│   └── ThemeContext.tsx     # Light/dark theme toggle
├── services/               # Axios API layer (see Services section)
├── pages/
│   ├── auth/               # Login, Register
│   ├── dashboard/          # DashboardPage
│   ├── customers/          # Individual & Business CRUD
│   ├── products/           # Loan product CRUD
│   ├── loans/              # Loan origination, detail, approval workbench
│   ├── disbursements/      # Disbursement queue, form, detail
│   ├── collections/        # Collection case list, form, detail
│   ├── recovery/           # Recovery & repayment management
│   ├── analytics/          # Analytics & reports
│   └── settings/           # Users, FSP settings
└── components/
    ├── BrandLogo.tsx
    ├── ConfirmDialog.tsx
    └── ThemeToggle.tsx
```

---

## Prerequisites

- Node.js 18 or later
- npm 9 or later

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_API_URL=http://localhost:8000
VITE_CUSTOMER_SERVICE_URL=http://localhost:8002
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Kong API Gateway base URL |
| `VITE_CUSTOMER_SERVICE_URL` | `http://localhost:8002` | Django customer registry service |

---

## Installation

```bash
npm install
npm run dev
```

The dev server starts on **http://localhost:5173**.

To build for production:

```bash
npm run build
npm run preview
```

---

## Backend Services Required

The frontend talks to a microservices backend. All services should be running before starting the frontend.

| Service | Default Port | Purpose |
|---|---|---|
| Auth Service | 3001 | Login, register, JWT refresh, user profile |
| User Service | 3002 | User management (RBAC, tenant users) |
| Tenant Service | 3003 | FSP/tenant configuration |
| Products / Loans / Disbursements / Repayments | 3000 | Core lending engine |
| Customer Django Service | 8002 | Individual and business customer registry |
| Collections & Recovery | 3008 | Delinquency cases, collection activities |
| Kong API Gateway | 8000 | Unified entry point (optional — can point services directly) |

---

## Pages / Routes

| Route | Page | Minimum Role |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Dashboard | Authenticated |
| `/analytics` | Analytics & Reports | Manager |
| `/recovery` | Recovery & Repayment | Loan Officer |
| `/products` | Product List | Admin |
| `/products/new` | Create Product | Admin |
| `/products/:id/edit` | Edit Product | Admin |
| `/products/:id` | Product Detail | Admin |
| `/customers` | Customer List | Loan Officer |
| `/customers/new/individual` | New Individual Customer | Loan Officer |
| `/customers/new/business` | New Business Customer | Loan Officer |
| `/customers/:id` | Individual Customer Detail | Loan Officer |
| `/customers/business/:id` | Business Customer Detail | Loan Officer |
| `/loans` | Loan List | Loan Officer |
| `/loans/new` | New Loan Application | Loan Officer |
| `/loans/:id` | Loan Detail | Loan Officer |
| `/approvals` | Approval Workbench | Manager |
| `/disbursements` | Disbursement Queue | Manager |
| `/disbursements/new` | New Disbursement | Manager |
| `/disbursements/:id` | Disbursement Detail | Manager |
| `/collections` | Collection Case List | Manager |
| `/collections/new` | New Collection Case | Manager |
| `/collections/:id` | Collection Case Detail | Manager |
| `/settings/users` | User Management | Admin |
| `/settings/fsp` | FSP Settings | Admin |

---

## Services (API Layer)

| File | Axios Client | Backend | Endpoints Covered |
|---|---|---|---|
| `api.ts` | `apiClient`, `customerApiClient`, `collectionApiClient`, `authApiClient` | All | Base clients, JWT bearer injection, 401 refresh interceptor |
| `auth.service.ts` | `authApiClient` | Auth Service (3001) | `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/profile`, `/auth/refresh` |
| `customer.service.ts` | `customerApiClient` | Customer Django (8002) | Individual customers CRUD, Business customers CRUD, search |
| `product.service.ts` | `apiClient` | Products/Loans (3000) | Product CRUD, activate/deactivate |
| `loan.service.ts` | `apiClient` | Products/Loans (3000) | Loan CRUD, eligibility check, submit, approve, reject |
| `disbursement.service.ts` | `apiClient` | Products/Loans (3000) | Disbursement create, list, detail, retry, reverse |
| `repayment.service.ts` | `apiClient` | Products/Loans (3000) | Schedule create/fetch, installments, payments, revisions |
| `collection.service.ts` | `collectionApiClient` | Collections (3008) | Collection cases CRUD, activity log |

---

## License

MIT
