import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProductListPage } from './pages/products/ProductListPage';
import { ProductFormPage } from './pages/products/ProductFormPage';
import { ProductDetailPage } from './pages/products/ProductDetailPage';
import { LoanListPage } from './pages/loans/LoanListPage';
import { LoanFormPage } from './pages/loans/LoanFormPage';
import { LoanDetailPage } from './pages/loans/LoanDetailPage';
import { ApprovalWorkbenchPage } from './pages/loans/ApprovalWorkbenchPage';
import { DisbursementQueuePage } from './pages/disbursements/DisbursementQueuePage';
import { DisbursementFormPage } from './pages/disbursements/DisbursementFormPage';
import { DisbursementDetailPage } from './pages/disbursements/DisbursementDetailPage';
import { UsersPage } from './pages/settings/UsersPage';
import { FspSettingsPage } from './pages/settings/FspSettingsPage';

function App() {
  // Note: Auth is mocked for now; hook into a real auth context later
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/products" element={<ProductListPage />} />
        <Route
          path="/products/new"
          element={<ProductFormPage mode="create" />}
        />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route
          path="/products/:id/edit"
          element={<ProductFormPage mode="edit" />}
        />

        <Route path="/loans" element={<LoanListPage />} />
        <Route path="/loans/new" element={<LoanFormPage />} />
        <Route path="/loans/:id" element={<LoanDetailPage />} />
        <Route path="/approvals" element={<ApprovalWorkbenchPage />} />

        <Route path="/disbursements" element={<DisbursementQueuePage />} />
        <Route path="/disbursements/new" element={<DisbursementFormPage />} />
        <Route path="/disbursements/:id" element={<DisbursementDetailPage />} />

        <Route path="/settings/users" element={<UsersPage />} />
        <Route path="/settings/fsp" element={<FspSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
