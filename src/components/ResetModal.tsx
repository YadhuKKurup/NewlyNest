'use client';

import React from 'react';
import { AlertTriangle, Trash2, RotateCcw, X } from 'lucide-react';
import { useBudgetStore } from '../store/useBudgetStore';
import { useAuth } from '../context/AuthContext';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { resetToDefault, clearAllWorkspaceItems } = useBudgetStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (user) {
      // Logged in user: Clear cloud items permanently to 0 items
      clearAllWorkspaceItems();
    } else {
      // Guest mode: Reset local storage back to 26 sample demo items
      resetToDefault();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {user ? 'Clear All Workspace Items?' : 'Reset Guest Demo Items?'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {user
              ? 'This will permanently delete all budget items in your active workspace database. Your dashboard will be reset to 0 items.'
              : 'This will restore the original 26 pre-categorized starter demo items for guest preview.'}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all"
          >
            {user ? <Trash2 className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
            <span>{user ? 'Clear All Items' : 'Reset Demo'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
