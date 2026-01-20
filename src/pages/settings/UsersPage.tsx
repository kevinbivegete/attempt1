export const UsersPage = () => {
  const users = [
    { id: 'U-001', name: 'Admin User', role: 'Admin' },
    { id: 'U-002', name: 'Loan Officer 1', role: 'Loan Officer' },
    { id: 'U-003', name: 'Ops User', role: 'Ops' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Users & Roles</h1>
          <p className="mt-1 text-sm text-slate-400">
            Lightweight view of FSP users and their roles for this module.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">User ID</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-t border-slate-800 hover:bg-slate-800/60"
              >
                <td className="px-4 py-2 text-slate-100">{u.id}</td>
                <td className="px-4 py-2 text-slate-200">{u.name}</td>
                <td className="px-4 py-2 text-slate-200">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
