export const UsersPage = () => {
  const users = [
    { id: 'U-001', email: 'superadmin@testfsp.com', role: 'Super Admin', status: 'Active' },
    { id: 'U-002', email: 'admin@testfsp.com', role: 'Admin', status: 'Active' },
    { id: 'U-003', email: 'manager@testfsp.com', role: 'Manager', status: 'Active' },
    { id: 'U-004', email: 'officer@testfsp.com', role: 'Loan Officer', status: 'Active' },
    { id: 'U-005', email: 'user@testfsp.com', role: 'User', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Users & Roles</h1>
        <p className="page-subtitle">FSP portal users and their assigned roles.</p>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="font-medium text-neutral-800">{u.email}</td>
                <td>
                  <span className="badge badge-info">{u.role}</span>
                </td>
                <td>
                  <span className="badge badge-success">{u.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
