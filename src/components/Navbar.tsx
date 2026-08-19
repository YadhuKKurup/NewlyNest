'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Home, Moon, Sun, Printer, RotateCcw, Plus, Sparkles, User as UserIcon, LogOut, Cloud, Settings, ShieldCheck, ChevronDown } from 'lucide-react';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">

        {/* Brand & Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 text-white shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform">
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
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Clean & Elegant Add Item Button */}
          <button
            onClick={onOpenAddItem}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>

          {/* Print / PDF Button */}
          <button
            onClick={onTriggerPrint}
            title="Export / Print PDF Report"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/50 dark:border-slate-700/50"
          >
            <Printer className="w-4 h-4 text-indigo-500" />
            <span>PDF Report</span>
          </button>

          {/* Reset Checklist Button */}
          <button
            onClick={onOpenResetModal}
            title="Reset Planner"
            className="hidden md:inline-flex items-center gap-2 px-2.5 sm:px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-all border border-slate-200/50 dark:border-slate-700/50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
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

          {/* User Profile Avatar / Sign In Trigger (Right Corner) */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-500 transition-all group shadow-sm"
              >
                <div className="relative">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="User Profile"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover border border-indigo-400/40"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
                </div>
                
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[90px] truncate hidden sm:inline">
                  {userName}
                </span>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200" />
              </button>

              {/* Profile Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-fadeIn">
                  
                  {/* Dropdown User Info Card */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/50 dark:from-slate-800/60 dark:to-indigo-950/40 border border-slate-200/60 dark:border-slate-800/60 mb-2">
                    <div className="flex items-center gap-2.5">
                      {userAvatar ? (
                        <img src={userAvatar} alt="Profile" className="w-9 h-9 rounded-xl object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {userName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" /> Account Active
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Cloud Synced
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  <div className="space-y-1">
                    <Link
                      href="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-indigo-500" />
                      <span>My Profile & Settings</span>
                    </Link>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onTriggerPrint();
                      }}
                      className="w-full flex sm:hidden items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Printer className="w-4 h-4 text-indigo-500" />
                      <span>Export PDF Report</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenResetModal();
                      }}
                      className="w-full flex md:hidden items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-500" />
                      <span>Reset Planner</span>
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <button
                      onClick={async () => {
                        setIsDropdownOpen(false);
                        await signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60 transition-all shadow-sm"
            >
              <Cloud className="w-4 h-4 text-indigo-500" />
              <span>Sign In / Sync</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
