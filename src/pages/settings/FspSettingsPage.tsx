export const FspSettingsPage = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">FSP Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure default GL accounts, channels, and operational toggles for
          this module.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Default GL Accounts
          </h2>
          <div className="space-y-2 text-xs">
            <div>
              <label className="mb-1 block text-slate-300">
                Default Disbursement GL
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-300">
                Default Write-off GL
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-100"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Channels</h2>
          <div className="space-y-2 text-xs text-slate-200">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-3 w-3 rounded border-slate-700 bg-slate-950"
              />
              <span>Enable MoMo</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-3 w-3 rounded border-slate-700 bg-slate-950"
              />
              <span>Enable Bank Transfer</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-3 w-3 rounded border-slate-700 bg-slate-950"
              />
              <span>Enable Cash / Cheque</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="rounded-md bg-primary-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-primary-400">
          Save Settings
        </button>
        <button className="rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800">
          Cancel
        </button>
      </div>
    </div>
  );
};
