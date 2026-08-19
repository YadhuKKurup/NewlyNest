'use client';

import React, { useState } from 'react';
import { X, User, Mail, ShieldCheck, Heart, Copy, Check, Download, Calendar, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Workspace } from '../lib/workspaceService';
import { useBudgetStore } from '../store/useBudgetStore';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkspace: Workspace | null;
  onOpenWorkspaceModal: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  activeWorkspace,
  onOpenWorkspaceModal,
}) => {
  const { user, signOut, updateUserProfile } = useAuth();
  const { items } = useBudgetStore();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'export'>('profile');
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !user) return null;

  const userAvatar = user.user_metadata?.avatar_url;
  const userEmail = user.email || 'No email registered';
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent Member';

  const inviteUrl = activeWorkspace
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}?invite=${activeWorkspace.id}`
    : '';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setIsSaving(true);
    const { error } = await updateUserProfile(displayName.trim());
    setIsSaving(false);
    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleCopyInvite = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Export Items to CSV
  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ['Category', 'Item Name', 'Min Price (INR)', 'Max Price (INR)', 'Actual Paid (INR)', 'Purchased', 'Notes'];
    const rows = items.map((item) => [
      `"${item.category}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      item.minPrice,
      item.maxPrice,
      item.actualSpent,
      item.purchased ? 'Yes' : 'No',
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NewlyNest_Budget_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Items to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NewlyNest_Budget_Data_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Top Decorative Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 rounded-full bg-gradient-to-br from-rose-500/20 to-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-56 h-56 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile Summary */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <div className="flex items-center gap-4">
            
            {/* Avatar Ring */}
            <div className="relative">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="User Avatar"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-400/40 shadow-xl"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center" title="Online & Synced">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            {/* Profile Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold tracking-tight">
                  {user.user_metadata?.full_name || displayName}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" /> Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-300" /> {userEmail}
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Member since {joinedDate}
              </p>
            </div>

          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-700/60 pb-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-colors border-b-2 ${
                activeTab === 'profile'
                  ? 'border-indigo-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-colors border-b-2 ${
                activeTab === 'workspace'
                  ? 'border-indigo-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Partner & Workspace</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-colors border-b-2 ${
                activeTab === 'export'
                  ? 'border-indigo-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup & Export</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* TAB 1: Profile Details */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registered Email (Read-Only)
                </label>
                <input
                  type="text"
                  readOnly
                  value={userEmail}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Saved Successfully!</span>
                    </>
                  ) : (
                    <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Workspace & Partner Settings */}
          {activeTab === 'workspace' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Active Workspace
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {activeWorkspace?.mode === 'couple' ? 'Couple Shared Sync' : 'Solo Mode'}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                  {activeWorkspace?.name || 'My Home Budget'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Budget Target: <strong>₹{activeWorkspace?.total_target_budget?.toLocaleString('en-IN') || '5,00,000'}</strong>
                </p>
              </div>

              {/* Partner Invite Section */}
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    Share Workspace with Partner
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-full">
                    Live Partner Sync
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Send this unique link to your spouse or partner. Opening the link will grant them live editing access to your workspace.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono focus:outline-none"
                  />
                  <button
                    onClick={handleCopyInvite}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition-colors whitespace-nowrap shadow-sm"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWorkspaceModal();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create / Switch Workspace</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Backup & Data Export */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-500" />
                  Export & Backup Your Budget Data
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Download a full backup of all your budget items, price targets, actual paid amounts, and notes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                
                {/* CSV Download */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={items.length === 0}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-indigo-500 transition-all text-left group disabled:opacity-50"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit mb-2">
                    <Download className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Export to Excel / CSV
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Download spreadsheet compatible format (.csv)
                  </p>
                </button>

                {/* JSON Backup Download */}
                <button
                  type="button"
                  onClick={handleExportJSON}
                  disabled={items.length === 0}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-indigo-500 transition-all text-left group disabled:opacity-50"
                >
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit mb-2">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Full JSON Data Backup
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Download raw JSON backup file (.json)
                  </p>
                </button>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
