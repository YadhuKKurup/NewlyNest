'use client';

import React from 'react';
import { Heart, Home, Moon, Sun, Printer, RotateCcw, Plus, Sparkles, User as UserIcon, LogOut, Cloud, Users } from 'lucide-react';
import { useBudgetStore } from '../store/useBudgetStore';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAddItem: () => void;
  onOpenResetModal: () => void;
  onTriggerPrint: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddItem,
  onOpenResetModal,
  onTriggerPrint,
  onOpenAuthModal,
}) => {
  const { isDarkMode, toggleDarkMode } = useBudgetStore();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">

        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 text-white shadow-lg shadow-pink-500/25">
            <Home className="w-5 h-5 sm:w-6 sm:h-6" />
            <Heart className="w-3 h-3 text-rose-200 absolute top-1 right-1 fill-rose-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
                Newly<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-600">Nest</span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                <Sparkles className="w-3 h-3" /> Planner
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Smart Setup & Budget Tracker
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Auth State Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-indigo-500" />
                )}
                <span className="max-w-[100px] truncate hidden sm:inline">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={signOut}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60 transition-all"
            >
              <Cloud className="w-3.5 h-3.5 text-indigo-500" />
              <span>Sign In / Sync</span>
            </button>
          )}

          {/* Print / PDF Button */}
          <button
            onClick={onTriggerPrint}
            title="Export / Print PDF Report"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/50 dark:border-slate-700/50"
          >
            <Printer className="w-4 h-4 text-indigo-500" />
            <span>Export PDF</span>
          </button>

          {/* Reset Checklist Button */}
          <button
            onClick={onOpenResetModal}
            title="Reset to Default Items"
            className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-all border border-slate-200/50 dark:border-slate-700/50"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Planner</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title="Toggle Light/Dark Theme"
            className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/50 dark:border-slate-700/50"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            )}
          </button>

          {/* Add New Item Button */}
          <button
            onClick={onOpenAddItem}
            className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Item</span>
          </button>
        </div>

      </div>
    </header>
  );
};
