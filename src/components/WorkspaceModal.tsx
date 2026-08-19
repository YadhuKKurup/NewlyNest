'use client';

import React, { useState } from 'react';
import { X, Users, Copy, Check, Heart, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workspaceService, Workspace } from '../lib/workspaceService';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkspace: Workspace | null;
  onWorkspaceCreated: (workspace: Workspace) => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  activeWorkspace,
  onWorkspaceCreated,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [targetBudget, setTargetBudget] = useState('500000');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setLoading(true);

    const budgetNum = parseFloat(targetBudget) || 500000;
    const ws = await workspaceService.createWorkspace(user.id, name.trim(), budgetNum, false);
    setLoading(false);

    if (ws) {
      onWorkspaceCreated(ws);
      onClose();
    }
  };

  const inviteUrl = activeWorkspace
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}?invite=${activeWorkspace.id}`
    : '';

  const handleCopyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {activeWorkspace ? 'Couple Workspace & Sharing' : 'Create Couple Workspace'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Invite your partner to edit and track budget items together in real-time
            </p>
          </div>
        </div>

        {/* Partner Invite Link Section */}
        {activeWorkspace && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                Invite Partner / Spouse Link
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                Real-Time Live Sync
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Create New Workspace Form */}
        <form onSubmit={handleCreate} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {activeWorkspace ? 'Create Another Workspace' : 'Setup Workspace'}
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Workspace / Couple Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul & Priya's Nest Budget"
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Total Target Home Budget (₹)
            </label>
            <input
              type="number"
              value={targetBudget}
              onChange={(e) => setTargetBudget(e.target.value)}
              placeholder="500000"
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Workspace'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
