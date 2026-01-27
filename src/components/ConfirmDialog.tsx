import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60">
      <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 shadow-xl">
        <div className="mb-2">
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        </div>
        <p className="mb-4 text-xs text-slate-300">{message}</p>
        <div className="flex justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-600 px-3 py-1 text-slate-200 hover:bg-slate-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-rose-500 px-3 py-1 font-medium text-slate-950 hover:bg-rose-400"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

