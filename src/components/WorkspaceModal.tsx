'use client';

import React, { useState } from 'react';
import { X, Users, Copy, Check, Heart, Plus, User } from 'lucide-react';
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
  const [mode, setMode] = useState<'solo' | 'couple'>('solo');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setLoading(true);

    const budgetNum = parseFloat(targetBudget) || 500000;
    const ws = await workspaceService.createWorkspace(user.id, name.trim(), budgetNum, false, mode);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn overflow-x-hidden overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[85vh] overflow-x-hidden overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Compact Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {activeWorkspace ? 'Workspace & Partner Settings' : 'Create New Workspace'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage personal or shared partner budget workspaces
            </p>
          </div>
        </div>

        {/* Partner Invite Link Section (Compact Horizontal Strip) */}
        {activeWorkspace && (
          <div className="mb-4 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                Invite Partner / Spouse Link
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                Real-Time Sync
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="w-full min-w-0 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono focus:outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-sm flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Create New Workspace Form */}
        <form onSubmit={handleCreate} className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Workspace Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('solo')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all ${
                  mode === 'solo'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 font-bold ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-900 dark:text-white font-extrabold">Solo Mode</div>
                  <div className="text-[10px] font-normal text-slate-500">Individual use</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('couple')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all ${
                  mode === 'couple'
                    ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/60 font-bold ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-900 dark:text-white font-extrabold">Shared / Couple</div>
                  <div className="text-[10px] font-normal text-slate-500">Live partner sync</div>
                </div>
              </button>
            </div>
          </div>

          {/* Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={mode === 'solo' ? "e.g. My Home Budget" : "e.g. Rahul & Priya's Nest"}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Budget (₹)
              </label>
              <input
                type="number"
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                placeholder="500000"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating...' : 'Create Workspace'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
