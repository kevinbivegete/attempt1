import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
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
import { CollectionListPage } from './pages/collections/CollectionListPage';
import { CollectionFormPage } from './pages/collections/CollectionFormPage';
import { CollectionDetailPage } from './pages/collections/CollectionDetailPage';
import { CustomerListPage } from './pages/customers/CustomerListPage';
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage';
import { IndividualCustomerFormPage } from './pages/customers/IndividualCustomerFormPage';
import { BusinessCustomerFormPage } from './pages/customers/BusinessCustomerFormPage';
import { BusinessCustomerDetailPage } from './pages/customers/BusinessCustomerDetailPage';
import { UsersPage } from './pages/settings/UsersPage';
import { FspSettingsPage } from './pages/settings/FspSettingsPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { RecoveryPage } from './pages/recovery/RecoveryPage';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const { hasRole, loading } = useAuth();
  if (loading) return null;
  const allowed = roles.some((r) => hasRole(r));
  if (!allowed) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/analytics"
          element={
            <RoleRoute roles={['Super Admin', 'SUPER_ADMIN', 'Admin', 'ADMIN', 'Manager', 'MANAGER']}>
              <AnalyticsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/recovery"
          element={
            <RoleRoute roles={['Super Admin', 'SUPER_ADMIN', 'Admin', 'ADMIN', 'Manager', 'MANAGER', 'Loan Officer', 'LOAN_OFFICER']}>
              <RecoveryPage />
            </RoleRoute>
          }
        />

        {/* Products — Admin & Super Admin */}
        <Route
          path="/products"
          element={
            <RoleRoute roles={['Super Admin', 'Admin']}>
              <ProductListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <RoleRoute roles={['Super Admin', 'Admin']}>
              <ProductFormPage mode="create" />
            </RoleRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <RoleRoute roles={['Super Admin', 'Admin']}>
              <ProductFormPage mode="edit" />
            </RoleRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <RoleRoute roles={['Super Admin', 'Admin']}>
              <ProductDetailPage />
            </RoleRoute>
          }
        />

        {/* Customers — all except plain User */}
        <Route
          path="/customers"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager', 'Loan Officer']}>
              <CustomerListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/customers/new/individual"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager', 'Loan Officer']}>
              <IndividualCustomerFormPage />
            </RoleRoute>
          }
        />
        <Route
          path="/customers/new/business"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager', 'Loan Officer']}>
              <BusinessCustomerFormPage />
            </RoleRoute>
          }
        />
        <Route
          path="/customers/business/:id"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager', 'Loan Officer']}>
              <BusinessCustomerDetailPage />
            </RoleRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager', 'Loan Officer']}>
              <CustomerDetailPage />
            </RoleRoute>
          }
        />

        {/* Loans — Loan Officer, Manager, Admin, Super Admin */}
        <Route
          path="/loans"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager', 'Loan Officer']}>
              <LoanListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/loans/new"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager', 'Loan Officer']}>
              <LoanFormPage />
            </RoleRoute>
          }
        />
        <Route
          path="/loans/:id"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager', 'Loan Officer']}>
              <LoanDetailPage />
            </RoleRoute>
          }
        />

        {/* Approval — Manager, Admin, Super Admin only */}
        <Route
          path="/approvals"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager']}>
              <ApprovalWorkbenchPage />
            </RoleRoute>
          }
        />

        {/* Disbursements — Manager, Admin, Super Admin */}
        <Route
          path="/disbursements"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager']}>
              <DisbursementQueuePage />
            </RoleRoute>
          }
        />
        <Route
          path="/disbursements/new"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager']}>
              <DisbursementFormPage />
            </RoleRoute>
          }
        />
        <Route
          path="/disbursements/:id"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager']}>
              <DisbursementDetailPage />
            </RoleRoute>
          }
        />

        {/* Collections — Manager, Admin, Super Admin */}
        <Route
          path="/collections"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager']}>
              <CollectionListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/collections/new"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager']}>
              <CollectionFormPage />
            </RoleRoute>
          }
        />
        <Route
          path="/collections/:id"
          element={
            <RoleRoute roles={['Super Admin', 'Admin', 'Manager']}>
              <CollectionDetailPage />
            </RoleRoute>
          }
        />

        {/* Settings — Admin & Super Admin only */}
        <Route
          path="/settings/users"
          element={
            <RoleRoute roles={['Super Admin', 'Admin']}>
              <UsersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/settings/fsp"
          element={
            <RoleRoute roles={['Super Admin', 'Admin']}>
              <FspSettingsPage />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
