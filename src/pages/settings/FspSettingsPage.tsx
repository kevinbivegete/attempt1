export const FspSettingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">FSP Settings</h1>
        <p className="page-subtitle">
          Configure default GL accounts, channels, and operational toggles.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* GL Accounts */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-800">Default GL Accounts</h2>
          <div className="space-y-3">
            <div>
              <label className="form-label">Default Disbursement GL</label>
              <input type="text" className="form-input" placeholder="e.g. 1010-DISB" />
            </div>
            <div>
              <label className="form-label">Default Write-off GL</label>
              <input type="text" className="form-input" placeholder="e.g. 6020-WO" />
            </div>
          </div>
        </div>

        {/* Channels */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-800">Disbursement Channels</h2>
          <div className="space-y-3">
            {['Enable MoMo', 'Enable Bank Transfer', 'Enable Cash / Cheque'].map((ch) => (
              <label key={ch} className="flex items-center gap-3 text-sm text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-primary-700 focus:ring-primary-200"
                />
                {ch}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="btn-primary">Save Settings</button>
        <button className="btn-secondary">Cancel</button>
      </div>
    </div>
  );
};
