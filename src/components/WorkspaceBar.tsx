'use client';

import React from 'react';
import { Users, Heart, Sparkles, Share2, Plus, Wifi } from 'lucide-react';
import { Workspace } from '../lib/workspaceService';
import { useAuth } from '../context/AuthContext';

interface WorkspaceBarProps {
  activeWorkspace: Workspace | null;
  onOpenWorkspaceModal: () => void;
  onOpenAuthModal: () => void;
}

export const WorkspaceBar: React.FC<WorkspaceBarProps> = ({
  activeWorkspace,
  onOpenWorkspaceModal,
  onOpenAuthModal,
}) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-indigo-500/10 border border-indigo-200/50 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-rose-500 shadow-sm flex-shrink-0">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Collaborate with your Partner in Real-Time</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in with Google to create a shared couple workspace and edit prices live together.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAuthModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 shadow-md shadow-indigo-500/20 whitespace-nowrap transition-all"
        >
          <Users className="w-4 h-4" />
          <span>Sign In & Create Couple Workspace</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      
      {/* Workspace Name & Realtime Indicator */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex-shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold text-white">
              {activeWorkspace ? activeWorkspace.name : "Couple's Budget Workspace"}
            </h4>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Realtime Sync
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Real-time multi-device budgeting workspace
          </p>
        </div>
      </div>

      {/* Invite Partner Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenWorkspaceModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl text-indigo-200 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Invite Partner / Settings</span>
        </button>
      </div>

    </div>
  );
};
