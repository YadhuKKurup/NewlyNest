'use client';

import React, { useState } from 'react';
import { User, Users, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workspaceService, Workspace } from '../lib/workspaceService';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated: (workspace: Workspace) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onWorkspaceCreated,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<'solo' | 'couple'>('solo');
  const [name, setName] = useState('');
  const [targetBudget, setTargetBudget] = useState('500000');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'My';

  const handleModeSelect = (selectedMode: 'solo' | 'couple') => {
    setMode(selectedMode);
    if (selectedMode === 'solo') {
      setName(`${userName}'s Home Budget`);
    } else {
      setName(`${userName} & Partner's Nest`);
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setLoading(true);

    const budgetNum = parseFloat(targetBudget) || 500000;
    // Always seedDemoItems = false for logged in users (clean 0 items)
    const ws = await workspaceService.createWorkspace(
      user.id,
      name.trim(),
      budgetNum,
      false,
      mode
    );
    setLoading(false);

    if (ws) {
      onWorkspaceCreated(ws);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Ambient Lights */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 text-white mb-3 shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Set Up Your NewlyNest Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {step === 1 ? 'Choose how you want to manage your home budget' : 'Set up your budget target'}
          </p>
        </div>

        {/* STEP 1: Mode Selection (Solo vs Couple) */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option A: Solo Mode */}
              <button
                type="button"
                onClick={() => handleModeSelect('solo')}
                className={`p-5 rounded-2xl border-2 text-left transition-all relative group ${
                  mode === 'solo'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit mb-3">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Solo Mode</span>
                  <ArrowRight className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  For individual users managing their personal home budget across their own devices.
                </p>
                <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  Individual Budgeting
                </span>
              </button>

              {/* Option B: Shared / Couple Mode */}
              <button
                type="button"
                onClick={() => handleModeSelect('couple')}
                className={`p-5 rounded-2xl border-2 text-left transition-all relative group ${
                  mode === 'couple'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-rose-400 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 w-fit mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Couple / Shared</span>
                  <ArrowRight className="w-4 h-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Invite your partner or spouse to edit, track, and sync your home budget in real-time.
                </p>
                <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                  Live Partner Sync
                </span>
              </button>

            </div>
          </div>
        )}

        {/* STEP 2: Budget Target & Dashboard Name */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dashboard / Workspace Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Home Budget"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Total Target Home Budget (₹)
              </label>
              <input
                type="number"
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                placeholder="500000"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 text-xs text-indigo-700 dark:text-indigo-300">
              ✨ Your dashboard will launch as a <strong>clean 0-item list</strong> ready for you to add your personal items.
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Creating Dashboard...' : 'Launch My Dashboard'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
